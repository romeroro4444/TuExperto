const pool = require("./../db");

const getMyServices = async (req, res) => {
  try {
    const user_id = req.user;

    const profRes = await pool.query(
      `SELECT professional_id FROM professionals WHERE user_id = $1`,
      [user_id]
    );
    if (profRes.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Solo profesionales pueden acceder a sus servicios." });
    }
    const professional_id = profRes.rows[0].professional_id;
    const myServices = await pool.query(
      `SELECT s.*, p.profession_name
       FROM services s
       JOIN professionals prof ON s.professional_id = prof.professional_id
       JOIN professions p ON prof.profession_id = p.profession_id
       WHERE s.professional_id = $1
       ORDER BY s.publication_date DESC`,
      [professional_id]
    );
    res.json(myServices.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error al obtener servicios del profesional." });
  }
};

const getServices = async (req, res) => {
  try {
    const response = await pool.query(`
      SELECT services.*, professions.profession_name
      FROM services
      JOIN professionals ON services.professional_id = professionals.professional_id
      JOIN professions ON professionals.profession_id = professions.profession_id
    `);
    res.json(response.rows);
  } catch (error) {
    console.log(error);
  }
};

const getServiceById = async (req, res) => {
  try {
    const service_id = req.params.service_id;
    const response = await pool.query(
      `SELECT s.service_id, s.title AS service_name, s.description, s.price, s.modality, s.duration, s.professional_id,
              p.profession_name, u.name AS profesional_name
         FROM services s
         JOIN professionals prof ON s.professional_id = prof.professional_id
         JOIN professions p ON prof.profession_id = p.profession_id
         JOIN users u ON prof.user_id = u.user_id
         WHERE s.service_id = $1`,
      [service_id]
    );
    if (response.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }
    res.json(response.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el servicio" });
  }
};

const createService = async (req, res) => {
  try {
    const user_id = req.user;
    const { title, description, price, modality, duration } = req.body;

    const profRes = await pool.query(
      `SELECT professional_id FROM professionals WHERE user_id = $1`,
      [user_id]
    );
    if (profRes.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Solo profesionales pueden crear servicios." });
    }

    const professional_id = profRes.rows[0].professional_id;
    const text =
      "INSERT INTO services(title, description, price, modality, duration, professional_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *";
    const values = [
      title,
      description,
      price,
      modality,
      duration,
      professional_id,
    ];
    const response = await pool.query(text, values);

    const service_id = response.rows[0].service_id;
    await pool.query(
      `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description) 
      VALUES ($1,$2,$3,$4,$5)`,
      [user_id, "SERVICES", service_id, "POST", "Nuevo servicio creado"]
    );
    res.json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el servicio" });
  }
};

const deleteServiceById = async (req, res) => {
  try {
    const service_id = req.params.service_id;
    // Obtener datos actuales antes de eliminar
    const prevRes = await pool.query(
      "SELECT title, description, price, modality, duration, professional_id FROM services WHERE service_id = $1",
      [service_id]
    );
    if (prevRes.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    const prev = prevRes.rows[0];
    const text = "DELETE FROM services WHERE service_id = $1";
    const values = [service_id];
    const response = await pool.query(text, values);
    if (response.rowCount === 0)
      return res.status(404).json({ message: "Service not found" });

    // auditoria
    const descripcion = `Servicio eliminado. Datos previos: title: '${prev.title}', description: '${prev.description}', price: '${prev.price}', modality: '${prev.modality}', duration: '${prev.duration}', professional_id: '${prev.professional_id}'`;
    let user_id = req.user;
    if (!user_id) {
      // Buscar el user_id real del profesional
      const profRes = await pool.query(
        "SELECT user_id FROM professionals WHERE professional_id = $1",
        [prev.professional_id]
      );
      if (profRes.rows.length > 0) {
        user_id = profRes.rows[0].user_id;
      }
    }
    if (user_id) {
      await pool.query(
        `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description)
        VALUES ($1,$2,$3,$4,$5)`,
        [user_id, "SERVICES", service_id, "DELETE", descripcion]
      );
    }

    res.json(`Service ${service_id} deleted successfully`);
  } catch (error) {
    console.error(error);
  }
};

const editServiceById = async (req, res) => {
  try {
    const service_id = req.params.service_id;
    const { title, description, price, modality, duration } = req.body;
    // Obtener datos previos
    const prevRes = await pool.query(
      "SELECT title, description, price, modality, duration, professional_id FROM services WHERE service_id = $1",
      [service_id]
    );
    if (prevRes.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    const prev = prevRes.rows[0];

    // Actualizar servicio
    const text =
      "UPDATE services SET title = $1, description = $2, price = $3, modality = $4, duration = $5 WHERE service_id = $6 RETURNING *";
    const values = [title, description, price, modality, duration, service_id];
    const response = await pool.query(text, values);
    if (response.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Service not found after update" });
    }
    const updated = response.rows[0];

    // Cambios para auditoría
    const cambios = [];
    if (title && title !== prev.title)
      cambios.push(`title: '${prev.title}' → '${title}'`);
    if (description && description !== prev.description)
      cambios.push(`description: '${prev.description}' → '${description}'`);
    if (price && price !== prev.price)
      cambios.push(`price: '${prev.price}' → '${price}'`);
    if (modality && modality !== prev.modality)
      cambios.push(`modality: '${prev.modality}' → '${modality}'`);
    if (duration && duration !== prev.duration)
      cambios.push(`duration: '${prev.duration}' → '${duration}'`);
    const descripcion =
      cambios.length > 0
        ? `Servicio editado. Cambios: ${cambios.join(", ")}`
        : "Servicio editado. Sin cambios en los datos.";
    // Buscar el user_id del profesional dueño del servicio si no hay usuario autenticado
    let user_id = req.user;
    if (!user_id) {
      const profRes = await pool.query(
        "SELECT user_id FROM professionals WHERE professional_id = $1",
        [prev.professional_id]
      );
      if (profRes.rows.length > 0) {
        user_id = profRes.rows[0].user_id;
      }
    }
    if (user_id) {
      await pool.query(
        `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description)
    VALUES ($1,$2,$3,$4,$5)`,
        [user_id, "SERVICES", service_id, "DELETE", descripcion]
      );
    }
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al editar el servicio" });
  }
};

const changeToDeactivate = async (req, res) => {
  try {
    const service_id = req.params.service_id;
    const text = "UPDATE services SET active = false WHERE service_id = $1";
    const response = await pool.query(text, [service_id]);
    if (response.rowCount === 0) {
      return res.status(404).json({ message: "no se enceuntra ese servicio" });
    }
    res.json({ message: "Servicio desactivado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar el servicio" });
  }
};
const changeToActivate = async (req, res) => {
  try {
    const service_id = req.params.service_id;
    const text = "UPDATE services SET active = true WHERE service_id = $1";
    const response = await pool.query(text, [service_id]);
    if (response.rowCount === 0) {
      return res.status(404).json({ message: "no se enceuntra ese servicio" });
    }
    res.json({ message: "Servicio activado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar el servicio" });
  }
};

const editServiceByToken = async (req, res) => {
  const service_id = req.user;
  if (!service_id) {
    return res
      .status(401)
      .json({ message: "Token inválido o service_id no encontrado" });
  }
  const { title, description, price, modality, duration } = req.body;
  try {
    await pool.query(
      `UPDATE services SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        modality = COALESCE($4, modality),
        duration = COALESCE($5, duration)
      WHERE service_id = $6`,
      [title, description, price, modality, duration, service_id]
    );
    res.json({ message: "Servicio actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al editar el servicio" });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  deleteServiceById,
  editServiceById,
  getMyServices,
  changeToActivate,
  changeToDeactivate,
  editServiceByToken,
};
