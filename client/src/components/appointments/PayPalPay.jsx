import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

// Read env at module top-level so component body remains clean.
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function PayPalPay({
  appointmentId,
  amount,
  onSuccess,
  onCancel,
}) {
  const initialOptions = { clientId: PAYPAL_CLIENT_ID };
  const backendUrl = BACKEND_URL;

  const createOrder = async () => {
    try {
      // 1 USD = 1000 CLP
      const clpValue = amount != null ? Number(amount) : null;
      let usdAmountStr;
      if (clpValue != null && !Number.isNaN(clpValue)) {
        const usdAmount = clpValue / 1000;
        usdAmountStr = usdAmount.toFixed(2);
      }

      const response = await fetch(`${backendUrl}/paypal/createorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference_id: appointmentId || null,
          amount:
            usdAmountStr != null
              ? usdAmountStr
              : amount != null
              ? String(amount)
              : undefined,
          currency: "USD",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Create order failed: ${response.status} ${response.statusText} - ${text}`
        );
      }
      const text = await response.text();
      let orderData;
      try {
        orderData = JSON.parse(text);
      } catch (e) {
        orderData = text;
      }

      const orderId = typeof orderData === "string" ? orderData : orderData?.id;

      if (!orderId) {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : `Unexpected error occurred creating PayPal order: ${JSON.stringify(
              orderData
            )}`;
        throw new Error(errorMessage);
      }

      // retornar el id
      return orderId;
    } catch (error) {
      console.error("createOrder error:", error);
      throw error;
    }
  };

  const onApprove = async (data, actions) => {
    try {
      const capture = await actions.order.capture();

      if (appointmentId) {
        const token = localStorage.getItem("token");
        const resp = await fetch(
          `${backendUrl}/pay-appointment/${appointmentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", token },
          }
        );
        if (!resp.ok) {
          const txt = await resp.text();
          console.error(
            "Failed to mark appointment paid on backend:",
            resp.status,
            txt
          );
          throw new Error("Failed to update appointment status on server");
        }
      }

      if (onSuccess) onSuccess();
      return capture;
    } catch (err) {
      console.error("onApprove error:", err);
      throw err;
    }
  };

  const onError = (err) => {
    console.error("PayPal Buttons error:", err);
  };

  return (
    <div className="PayPalPay">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={() => onCancel && onCancel()}
          onError={onError}
          style={{ layout: "vertical" }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
