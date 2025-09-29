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
      "SELECT * FROM services WHERE service_id = $1",
      [service_id]
    );
    res.json(response.rows);
  } catch (error) {
    console.log(error);
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
    res.json({
      message: "Servicio creado exitosamente",
      body: response.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el servicio" });
  }
};

const deleteServiceById = async (req, res) => {
  try {
    const service_id = req.params.service_id;
    const text = "DELETE FROM services WHERE service_id = $1";
    const values = [service_id];
    const response = await pool.query(text, values);
    if (response.rowCount === 0)
      return res.status(404).json({
        message: "Service not found",
      });
    res.json(`Service ${service_id} deleted successfully`);
  } catch (error) {
    console.error(error);
  }
};

const editServiceById = async (req, res) => {
  const service_id = req.params.service_id;
  const { title, description, price, modality, duration } = req.body;
  const text =
    "UPDATE services SET title = $1, description = $2, price = $3, modality = $4, duration = $5 WHERE service_id = $6";
  const values = [title, description, price, modality, duration, service_id];
  const response = await pool.query(text, values);

  if (response.rows.rowCount === 0)
    return res.status(404).json({
      message: "Service not found",
    });
  console.log(response);
  res.json({
    message: "Service edited",
    body: {
      task: { title, description, price, modality, duration },
    },
  });
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
