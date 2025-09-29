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
      SELECT r.*, professions.profession_name
      FROM services_requests r
      JOIN users ON r.user_id = users.user_id
      JOIN professions ON r.profession_id = professions.profession_id
    `);
    res.json(response.rows);
  } catch (error) {
    console.log(error);
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
    const text = "DELETE FROM services_requests WHERE request_id = $1";
    const values = [request_id];
    const response = await pool.query(text, values);
    if (response.rowCount === 0)
      return res.status(404).json({
        message: "Request not found",
      });
    res.json(`Request ${request_id} deleted successfully`);
  } catch (error) {
    console.error(error);
  }
};

const editRequestById = async (req, res) => {
  const request_id = req.params.request_id;
  const { profession_id, title, description, budget } = req.body;
  const text =
    "UPDATE services_requests SET profession_id = $1, title = $2, description = $3, budget = $4 WHERE request_id = $5";
  const values = [profession_id, title, description, budget, request_id];
  const response = await pool.query(text, values);

  if (response.rowCount === 0)
    return res.status(404).json({
      message: "Request not found",
    });
  res.json({
    message: "Request edited",
    body: {
      task: { profession_id, title, description, budget },
    },
  });
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
