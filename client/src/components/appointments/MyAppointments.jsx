import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    appt: null,
  });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bank: "",
    account_number: "",
    rut: "",
    beneficiary_name: "",
    note: "",
  });

  const handleDecision = async (appointment_id, decision) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4000/decision-appointment/${appointment_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", token },
          body: JSON.stringify({ status: decision }),
        }
      );
      if (res.ok) {
        // Actualizar la lista de citas después de la decisión
        const updated = await fetch("http://localhost:4000/my-appointments", {
          method: "GET",
          headers: { token },
        });
        const data = await updated.json();
        setAppointments(Array.isArray(data) ? data : []);
        toast.success(`La cita fue ${decision.toLowerCase()} correctamente`);
      } else {
        toast.error("No se pudo actualizar la cita");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al cancelar la cita");
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/my-appointments", {
        method: "GET",
        headers: { token },
      });
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      setAppointments(rows);
      if (rows.length > 0) {
        const b = rows[0].balance ?? rows[0].professional_balance ?? null;
        setBalance(b);
      } else {
        setBalance(null);
      }
    } catch (error) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const openWithdrawModal = () => setShowWithdrawModal(true);
  const closeWithdrawModal = () => setShowWithdrawModal(false);

  const handleWithdrawChange = (e) => {
    const { name, value } = e.target;
    setWithdrawForm((s) => ({ ...s, [name]: value }));
  };

  const submitWithdraw = async () => {
    try {
      const token = localStorage.getItem("token");
      // basic validation
      if (!withdrawForm.amount || Number(withdrawForm.amount) <= 0) {
        toast.error("Ingrese un monto válido");
        return;
      }
      const res = await fetch("http://localhost:4000/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify(withdrawForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Solicitud enviada");
        closeWithdrawModal();
        // actualiza las citas
        fetchMyAppointments();
      } else {
        toast.error(data.error || "Error al enviar solicitud");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar solicitud");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-8 lg:p-12 mt-10">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
          Gestionar Citas
        </h2>
        <div className="flex flex-col sm:flex-row ">
          <span className="relative group inline-flex items-center">
            <span
              className="w-6 h-6 text-xs rounded-full bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer"
              tabIndex={0}
              aria-describedby="saldo-help"
              aria-label="Ayuda sobre saldo"
            >
              ?
            </span>
            <div
              id="saldo-help"
              role="tooltip"
              className="pointer-events-none absolute left-0 -bottom-10 w-64 transform -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 transition-all bg-white text-gray-800 text-sm p-2 rounded-lg shadow-lg z-50"
            >
              La transferencia de dinero puede demorar entre 3 y 7 días hábiles.
              Ten en cuenta que el monto recibido podría ser inferior al
              indicado, debido a retenciones por intereses o impuestos.
            </div>
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
            Saldo {balance != null ? `$${balance}` : "$0"}
          </h2>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg sm:text-xl font-semibold text-[#1E3A8A] mb-3">
          Citas agendadas
        </h3>
        <button
          className={`px-4 py-2 rounded-md font-semibold ${
            balance > 0
              ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
          onClick={openWithdrawModal}
          disabled={!(balance > 0)}
          title={balance > 0 ? "Retirar fondos" : "Saldo insuficiente"}
        >
          Retirar Fondos
        </button>
      </div>

      {loading ? (
        <p className="text-[#1E3A8A]">Cargando citas...</p>
      ) : appointments.length === 0 ? (
        <p className="text-[#FE7743]">No tienes citas agendadas.</p>
      ) : (
        <div className="grid gap-6">
          {appointments.map((appt) => (
            <div
              key={appt.appointment_id}
              className="bg-white border rounded-lg shadow p-4"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500">Servicio</div>
                  <h4 className="text-xl font-bold text-[#1E3A8A]">
                    {appt.title}
                  </h4>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">
                    {appt.description}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="bg-[#FE7743] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ${appt.price}
                    </span>
                    <span className="bg-gray-100 text-[#1E3A8A] px-3 py-1 rounded-full text-sm">
                      {appt.modality}
                    </span>
                    <span className="bg-gray-100 text-[#1E3A8A] px-3 py-1 rounded-full text-sm">
                      {appt.duration}
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-64 text-right md:text-left">
                  <div className="text-sm text-gray-500">Fecha</div>
                  <div className="font-semibold text-[#1E3A8A]">
                    {appt.reservation_date
                      ? new Date(appt.reservation_date).toLocaleString()
                      : "—"}
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">Estado</div>
                    <div className="font-semibold">
                      {appt.status || "PENDIENTE"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                {appt.client_name ? (
                  <div>
                    <div className="text-sm text-gray-500">Cliente</div>
                    <div className="font-semibold text-[#1E3A8A]">
                      {appt.client_name} {appt.client_lastname || ""}
                    </div>
                    <div className="text-sm text-gray-700">
                      {appt.client_email || ""}
                      {appt.client_telefono ? ` · ${appt.client_telefono}` : ""}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-gray-500">Profesional</div>
                    <div className="font-semibold text-[#1E3A8A]">
                      {appt.professional_name}{" "}
                      {appt.professional_lastname || ""}
                    </div>
                    <div className="text-sm text-gray-700">
                      {appt.professional_email || ""}
                      {appt.professional_telefono
                        ? ` · ${appt.professional_telefono}`
                        : ""}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  {appt.status === "PENDIENTE" && (
                    <>
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600"
                        onClick={() =>
                          setConfirm({ open: true, type: "accept", appt })
                        }
                      >
                        Aceptar
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600"
                        onClick={() =>
                          setConfirm({ open: true, type: "reject", appt })
                        }
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-[#1E3A8A]">
              {confirm.type === "accept" ? "Aceptar Cita" : "Rechazar Cita"}
            </h3>
            <p className="mt-2 text-gray-700">
              ¿Estás seguro que deseas{" "}
              {confirm.type === "accept" ? "aceptar" : "rechazar"} esta cita?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-200"
                onClick={() =>
                  setConfirm({ open: false, type: null, appt: null })
                }
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white"
                onClick={() => {
                  setConfirm({ open: false, type: null, appt: null });
                  if (confirm.type === "accept") {
                    handleDecision(confirm.appt.appointment_id, "ACEPTADA");
                  } else if (confirm.type === "reject") {
                    handleDecision(confirm.appt.appointment_id, "RECHAZADA");
                  }
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-lg font-bold text-[#1E3A8A]">Retirar Fondos</h3>
            <p className="mt-2 text-gray-700">
              Completa los datos para solicitar el retiro.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="text-sm text-gray-600">Monto</label>
              <input
                name="amount"
                value={withdrawForm.amount}
                onChange={handleWithdrawChange}
                className="border rounded px-3 py-2"
                placeholder="Ej: 50000"
                type="number"
                min="0"
              />
              {balance != null &&
                Number(withdrawForm.amount) > Number(balance) && (
                  <div className="text-sm text-red-600">
                    El monto supera tu saldo disponible.
                  </div>
                )}

              <label className="text-sm text-gray-600">Banco</label>
              <input
                name="bank"
                value={withdrawForm.bank}
                onChange={handleWithdrawChange}
                className="border rounded px-3 py-2"
                placeholder="Nombre del banco"
              />

              <label className="text-sm text-gray-600">Número de cuenta</label>
              <input
                name="account_number"
                value={withdrawForm.account_number}
                onChange={handleWithdrawChange}
                className="border rounded px-3 py-2"
                placeholder="12345678"
              />

              <label className="text-sm text-gray-600">RUT / ID</label>
              <input
                name="rut"
                value={withdrawForm.rut}
                onChange={handleWithdrawChange}
                className="border rounded px-3 py-2"
                placeholder="12.345.678-9"
              />

              <label className="text-sm text-gray-600">Beneficiario</label>
              <input
                name="beneficiary_name"
                value={withdrawForm.beneficiary_name}
                onChange={handleWithdrawChange}
                className="border rounded px-3 py-2"
                placeholder="Nombre del beneficiario"
              />

              <label className="text-sm text-gray-600">Nota (opcional)</label>
              <textarea
                name="note"
                value={withdrawForm.note}
                onChange={handleWithdrawChange}
                className="border rounded px-3 py-2"
                placeholder="Instrucciones o referencia"
                rows={3}
              />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-200"
                onClick={() => {
                  closeWithdrawModal();
                }}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 rounded-md text-white ${
                  Number(withdrawForm.amount) > 0 &&
                  Number(balance || 0) >= Number(withdrawForm.amount)
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
                onClick={submitWithdraw}
                disabled={
                  !(
                    Number(withdrawForm.amount) > 0 &&
                    Number(balance || 0) >= Number(withdrawForm.amount)
                  )
                }
              >
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
