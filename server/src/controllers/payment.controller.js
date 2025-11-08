const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

// Webhook para MercadoPago
const handleWebhook = async (req, res) => {
  try {
    // MercadoPago envía la notificación en req.body
    console.log("Webhook recibido:", req.body);
    // Aquí puedes procesar y guardar la info en la base de datos si lo necesitas
    res.status(200).send("Webhook recibido");
  } catch (error) {
    console.error("Error en webhook:", error);
    res.status(500).send("Error en webhook");
  }
};

const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-8982834262475149-103100-49c5d972719e44be5e8ce7db09161adc-2588010389", // Usa tu token sandbox aquí
});

const preference = new Preference(client);
const payment = new Payment(client);

const { v4: uuidv4 } = require("uuid");

const createOrder = async (req, res) => {
  try {
    const { title, price } = req.body;
    const external_reference = uuidv4();
    const result = await preference.create({
      body: {
        items: [
          {
            title: title || "Servicio",
            unit_price: price || 0,
            currency_id: "CLP",
            quantity: 1,
          },
        ],
        purpose: "wallet_purchase",
        external_reference,
        back_urls: {
          success: "http://localhost:4000/success",
          failure: "http://localhost:4000/failure",
          pending: "http://localhost:4000/pending",
        },
      },
    });

    res.json({ preferenceId: String(result.id), external_reference });
  } catch (error) {
    console.error("MercadoPago error:", error);
    res.status(500).json(error);
  }
};

const processPayment = async (req, res) => {
  try {
    const paymentData = req.body;
    const result = await payment.create({ body: paymentData });
    res.json({ status: "success", mp: result });
  } catch (error) {
    console.error("Error al procesar el pago:", error);
    res
      .status(500)
      .json({ error: "Error al procesar el pago", details: error });
  }
};

module.exports = { createOrder, processPayment, handleWebhook };
