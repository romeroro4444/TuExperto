const pool = require("./../db");

const createReview = async (req, res) => {
  try {
    const { appointment_id, comment, rating } = req.body;
    const text =
      "INSERT INTO reviews(appointment_id, comment, rating, done) VALUES($1,$2,$3,$4) RETURNING *";
    const values = [appointment_id, comment, rating, true];
    const response = await pool.query(text, values);
    await pool.query(
      `UPDATE professionals SET review_count = COALESCE(review_count,0) + 1 WHERE professional_id = (
         SELECT s.professional_id FROM appointments a JOIN services s ON a.service_id = s.service_id WHERE a.appointment_id = $1
       )`, //aumentar el número de reseñas que tiene el profesional
      [appointment_id]
    );
    res.json({
      message: "la reseña fue correctamente insertada",
      body: response.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error crear una reseña" });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const user_id = req.user;
    // obtener todas las citas del usuario
    const appointmentsRes = await pool.query(
      "SELECT appointment_id FROM appointments WHERE user_id = $1",
      [user_id]
    );
    const appointmentIds = appointmentsRes.rows.map(
      (row) => row.appointment_id
    );
    if (appointmentIds.length === 0) {
      return res.json([]);
    }
    // obtener todas las reseñas asociadas a esas citas
    const reviewsRes = await pool.query(
      `SELECT * FROM reviews WHERE appointment_id = ANY($1::int[])`,
      [appointmentIds]
    );
    res.json(reviewsRes.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al ver reseñas" });
  }
};

const getReviews = async (req, res) => {
  try {
    const query = `
      SELECT r.*, 
             cu.rut AS client_rut,
             pu.rut AS professional_rut
      FROM reviews r
      LEFT JOIN appointments a ON r.appointment_id = a.appointment_id
      LEFT JOIN users cu ON a.user_id = cu.user_id
      LEFT JOIN services s ON a.service_id = s.service_id
      LEFT JOIN professionals prof ON s.professional_id = prof.professional_id
      LEFT JOIN users pu ON prof.user_id = pu.user_id
    `;
    const response = await pool.query(query);
    res.json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reseñas" });
  }
};

const getReviewsByService = async (req, res) => {
  try {
    const service_id = req.params.service_id;
    if (!service_id)
      return res.status(400).json({ error: "service_id requerido" });
    const query = `
      SELECT r.review_id, r.appointment_id, r.comment, r.rating, r.review_date,
             cu.user_id as client_id, cu.name as client_name, cu.lastname as client_lastname, cu.rut as client_rut,
             s.service_id, s.title as service_title
      FROM reviews r
      JOIN appointments a ON r.appointment_id = a.appointment_id
      JOIN services s ON a.service_id = s.service_id
      LEFT JOIN users cu ON a.user_id = cu.user_id
      WHERE s.service_id = $1
      ORDER BY r.review_date DESC
    `;
    const response = await pool.query(query, [service_id]);
    res.json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reseñas del servicio" });
  }
};

const clientReview = async (req, res) => {
  try {
    const user_id = req.user;
    // Obtener todas las citas del usuario
    const appointmentsRes = await pool.query(
      "SELECT appointment_id FROM appointments WHERE user_id = $1",
      [user_id]
    );
    const appointmentIds = appointmentsRes.rows.map(
      (row) => row.appointment_id
    );
    if (appointmentIds.length === 0) {
      return res.json([]);
    }
    // Obtener todas las reviews hechas por el cliente
    const reviewsRes = await pool.query(
      `SELECT * FROM reviews WHERE appointment_id = ANY($1::int[])`,
      [appointmentIds]
    );
    res.json(reviewsRes.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las reviews del cliente" });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getReviews,
  getReviewsByService,
  clientReview,
};
