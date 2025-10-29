import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    appt: null,
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

  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/my-appointments", {
          method: "GET",
          headers: { token },
        });
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAppointments();
  }, []);

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-8 lg:p-12 mt-10">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
          Gestionar Citas
        </h2>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-[#1E3A8A] mb-3">
        Citas agendadas
      </h3>

      {loading ? (
        <p className="text-[#1E3A8A]">Cargando citas...</p>
      ) : appointments.length === 0 ? (
        <p className="text-[#FE7743]">No tienes citas agendadas. 🥹</p>
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
    </div>
  );
};

export default MyAppointments;
