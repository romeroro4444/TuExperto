import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

initMercadoPago("APP_USR-c677a003-a5fd-4fca-9e6f-c667903ec293");

const Pay = ({ title, price, onClose }) => {
  const [preferenceId, setPreferenceId] = useState(null);

  useEffect(() => {
    const fetchPreference = async () => {
      const res = await fetch("http://localhost:4000/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, price }),
      });
      const data = await res.json();
      setPreferenceId(data.preferenceId);
    };
    fetchPreference();
  }, [title, price]);

  const initialization = {
    amount: price,
    preferenceId,
  };

  const customization = {
    paymentMethods: {
      creditCard: "all",
      prepaidCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
  };

  const onSubmit = ({ selectedPaymentMethod, formData }) => {
    return new Promise((resolve, reject) => {
      fetch("http://localhost:4000/process_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then(() => resolve())
        .catch(() => reject());
    });
  };

  const onReady = () => {};
  const onError = (error) => {
    console.error(error);
  };

  return (
    <div>
      {preferenceId ? (
        <Payment
          initialization={initialization}
          customization={customization}
          onSubmit={onSubmit}
          onReady={onReady}
          onError={onError}
        />
      ) : (
        <div>Cargando pago...</div>
      )}
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};

export default Pay;
