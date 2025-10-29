const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = require("../db");

// Controlador para pagos
const createPaymentSession = async (req, res) => {
  try {
    const { service_id } = req.body;
    if (!service_id) {
      return res.status(400).json({ error: "Falta el service_id" });
    }
    // Buscar el servicio en la base de datos
    const result = await pool.query(
      `SELECT title, description, price FROM services WHERE service_id = $1`,
      [service_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }
    const { title, description, price } = result.rows[0];
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            product_data: {
              name: title,
              description: description,
            },
            currency: "clp",
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: process.env.SUCCESS_URL || "https://tuapp.com/success",
      cancel_url: process.env.CANCEL_URL || "https://tuapp.com/cancel",
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPaymentSession,
};
