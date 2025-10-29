import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Recibe servicios y crea sesión de pago
export const createSession = async (req, res) => {
  try {
    // Espera que el frontend envíe un array de servicios: [{ name, description, price, quantity }]
    const { services } = req.body;
    const line_items = services.map((service) => ({
      price_data: {
        product_data: {
          name: service.name,
          description: service.description,
        },
        currency: "clp",
        unit_amount: service.price,
      },
      quantity: service.quantity || 1,
    }));
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: process.env.SUCCESS_URL || "https://tuapp.com/success",
      cancel_url: process.env.CANCEL_URL || "https://tuapp.com/cancel",
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
