const pool = require("./../db");

const getMyRequests = async (req, res) => {
  try {
    const user_id = req.user;
    // Obtener todas las solicitudes del cliente
    const requestsRes = await pool.query(
      `SELECT r.*, p.profession_name
       FROM services_requests r
       JOIN professions p ON r.profession_id = p.profession_id
       WHERE r.user_id = $1
       ORDER BY r.publication_date DESC`,
      [user_id]
    );
    res.json(requestsRes.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error al obtener solicitudes del cliente." });
  }
};

const getRequests = async (req, res) => {
  try {
    const response = await pool.query(`
      SELECT r.*, professions.profession_name, u.rut, u.name, u.lastname
      FROM services_requests r
      JOIN users u ON r.user_id = u.user_id
      JOIN professions ON r.profession_id = professions.profession_id
      ORDER BY r.publication_date DESC
    `);
    res.json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener solicitudes" });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request_id = req.params.request_id;
    const response = await pool.query(
      "SELECT r.*, p.profession_name FROM services_requests r JOIN professions p ON r.profession_id = p.profession_id WHERE r.request_id = $1",
      [request_id]
    );
    res.json(response.rows);
  } catch (error) {
    console.log(error);
  }
};

const createRequest = async (req, res) => {
  try {
    const user_id = req.user;
    const { profession_id, title, description, budget } = req.body;
    // insertar nueva solicitud de servicio
    const text =
      "INSERT INTO services_requests(user_id, profession_id, title, description, budget) VALUES ($1,$2,$3,$4,$5) RETURNING *";
    const values = [user_id, profession_id, title, description, budget];
    const response = await pool.query(text, values);
    // auditoría
    if (user_id) {
      await pool.query(
        `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description)
        VALUES ($1,$2,$3,$4,$5)`,
        [
          user_id,
          "SERVICES_REQUESTS",
          response.rows[0].request_id,
          "POST",
          `Solicitud creada: title='${title}', profession_id='${profession_id}', budget='${budget}'`,
        ]
      );
    }
    res.json({
      message: "Solicitud creada exitosamente",
      body: response.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la solicitud" });
  }
};

const deleteRequestById = async (req, res) => {
  try {
    const request_id = req.params.request_id;
    // Obtener el user_id antes de eliminar
    const prevRes = await pool.query(
      "SELECT user_id, profession_id, title, budget FROM services_requests WHERE request_id = $1",
      [request_id]
    );
    const prev = prevRes.rows[0];
    const text = "DELETE FROM services_requests WHERE request_id = $1";
    const values = [request_id];
    const response = await pool.query(text, values);
    if (response.rowCount === 0)
      return res.status(404).json({
        message: "Request not found",
      });
    // auditoría
    let user_id = prev ? prev.user_id : null;
    if (user_id) {
      await pool.query(
        `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description)
        VALUES ($1,$2,$3,$4,$5)`,
        [
          user_id,
          "SERVICES_REQUESTS",
          request_id,
          "DELETE",
          `Solicitud eliminada: title='${prev.title}', profession_id='${prev.profession_id}', budget='${prev.budget}'`,
        ]
      );
    }
    res.json(`Request ${request_id} deleted successfully`);
  } catch (error) {
    console.error(error);
  }
};

const editRequestById = async (req, res) => {
  try {
    const request_id = req.params.request_id;
    const { profession_id, title, description, budget } = req.body;
    // Obtener datos previos
    const prevRes = await pool.query(
      "SELECT user_id, profession_id, title, description, budget FROM services_requests WHERE request_id = $1",
      [request_id]
    );
    if (prevRes.rows.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }
    const prev = prevRes.rows[0];
    const text =
      "UPDATE services_requests SET profession_id = $1, title = $2, description = $3, budget = $4 WHERE request_id = $5";
    const values = [profession_id, title, description, budget, request_id];
    const response = await pool.query(text, values);
    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Request not found" });
    }
    // Cambios para auditoría
    const cambios = [];
    if (profession_id && profession_id !== prev.profession_id)
      cambios.push(
        `profession_id: '${prev.profession_id}' → '${profession_id}'`
      );
    if (title && title !== prev.title)
      cambios.push(`title: '${prev.title}' → '${title}'`);
    if (description && description !== prev.description)
      cambios.push(`description: '${prev.description}' → '${description}'`);
    if (budget && budget !== prev.budget)
      cambios.push(`budget: '${prev.budget}' → '${budget}'`);
    const descripcion =
      cambios.length > 0
        ? `Solicitud editada. Cambios: ${cambios.join(", ")}`
        : "Solicitud editada. Sin cambios en los datos.";
    // auditoría
    const user_id = prev.user_id;
    if (user_id) {
      await pool.query(
        `INSERT INTO audit(user_id, affected_table, affected_record_id, action, description)
        VALUES ($1,$2,$3,$4,$5)`,
        [user_id, "SERVICES_REQUESTS", request_id, "PUT", descripcion]
      );
    }
    res.json({
      message: "Request edited",
      body: {
        task: { profession_id, title, description, budget },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al editar la solicitud" });
  }
};

const changeToDeactivateRequest = async (req, res) => {
  try {
    const request_id = req.params.request_id;
    const text =
      "UPDATE services_requests SET active = false WHERE request_id = $1";
    const response = await pool.query(text, [request_id]);
    if (response.rowCount === 0) {
      return res.status(404).json({ message: "No se encuentra esa solicitud" });
    }
    res.json({ message: "Solicitud desactivada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar la solicitud" });
  }
};

const changeToActivateRequest = async (req, res) => {
  try {
    const request_id = req.params.request_id;
    const text =
      "UPDATE services_requests SET active = true WHERE request_id = $1";
    const response = await pool.query(text, [request_id]);
    if (response.rowCount === 0) {
      return res.status(404).json({ message: "No se encuentra esa solicitud" });
    }
    res.json({ message: "Solicitud activada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al activar la solicitud" });
  }
};

const editRequestByToken = async (req, res) => {
  const request_id = req.user;
  if (!request_id) {
    return res
      .status(401)
      .json({ message: "Token inválido o request_id no encontrado" });
  }
  const { profession_id, title, description, budget } = req.body;
  try {
    await pool.query(
      `UPDATE services_requests SET
        profession_id = COALESCE($1, profession_id),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        budget = COALESCE($4, budget)
      WHERE request_id = $5`,
      [profession_id, title, description, budget, request_id]
    );
    res.json({ message: "Solicitud actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al editar la solicitud" });
  }
};

const createRequestWithUserId = async (req, res) => {
  try {
    const { user_id, profession_id, title, description, budget } = req.body;
    if (!user_id || !profession_id || !title || !description || !budget) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    const text =
      "INSERT INTO services_requests(user_id, profession_id, title, description, budget) VALUES ($1,$2,$3,$4,$5) RETURNING *";
    const values = [user_id, profession_id, title, description, budget];
    const response = await pool.query(text, values);
    res.json({
      message: "Solicitud creada exitosamente (con user_id)",
      body: response.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la solicitud con user_id" });
  }
};

module.exports = {
  getMyRequests,
  getRequests,
  getRequestById,
  createRequest,
  createRequestWithUserId,
  deleteRequestById,
  editRequestById,
  editRequestByToken,
  changeToActivateRequest,
  changeToDeactivateRequest,
};
