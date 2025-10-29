const pool = require("./../db");

const createReview = async (req, res) => {
  try {
    const { appointment_id, comment, rating } = req.body;
    const text =
      "INSERT INTO reviews(appointment_id, comment, rating, done) VALUES($1,$2,$3,$4)";
    const values = [appointment_id, comment, rating, true];
    const response = await pool.query(text, values);
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
    const response = await pool.query("SELECT * FROM reviews");
    res.json(response.rows);
  } catch (error) {
    console.log(error);
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
  clientReview,
};
