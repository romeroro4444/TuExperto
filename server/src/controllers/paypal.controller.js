const { config } = require("dotenv");
config();

const getAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENTID;
  const secret = process.env.PAYPAL_SECRET;
  const baseUrl = process.env.PAYPAL_BASEURL;

  if (!clientId || !secret) {
    throw new Error("PAYPAL_CLIENTID or PAYPAL_SECRET not set in environment");
  }
  if (!baseUrl) {
    throw new Error(
      "PAYPAL_BASEURL not set in environment (e.g. https://api.sandbox.paypal.com)"
    );
  }

  const url = `${baseUrl.replace(/\/$/, "")}/v1/oauth2/token`;
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const text = await resp.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (e) {
    body = text;
  }

  if (!resp.ok) {
    console.error("PayPal token error", resp.status, body);
    throw new Error(
      `PayPal token request failed: ${resp.status} - ${JSON.stringify(body)}`
    );
  }

  return body.access_token;
};

const createOrder = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const url = `${process.env.PAYPAL_BASEURL.replace(
      /\/$/,
      ""
    )}/v2/checkout/orders`;

    // monto del cliente
    const { amount, reference_id } = req.body || {};
    const currency = "USD";

    if (!amount) {
      return res.status(400).json({ error: "amount is required" });
    }
    const amountValue = typeof amount === "number" ? String(amount) : amount;

    const body = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: reference_id || "order-ref-123",
          amount: {
            currency_code: String(currency).toUpperCase(),
            value: amountValue,
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            payment_method_selected: "PAYPAL",
            brand_name: "EXAMPLE INC",
            locale: "es-CL",
            landing_page: "LOGIN",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: "https://example.com/returnUrl",
            cancel_url: "https://example.com/cancelUrl",
          },
        },
      },
    };

    // crear la ordene en paypal
    const payload = JSON.stringify(body);
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: payload,
    });

    let data;
    try {
      data = await resp.json();
    } catch (e) {
      data = await resp.text();
    }

    if (!resp.ok) {
      console.error("PayPal create order error", resp.status, data);
      return res
        .status(502)
        .json({ error: "Error creating PayPal order", details: data });
    }

    // retorna el id
    return res.status(200).json(data.id);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
};

module.exports = { createOrder };
