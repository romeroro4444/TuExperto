import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const StarRating = ({ rating, setRating }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={
          star <= rating ? "text-yellow-400 text-2xl" : "text-gray-300 text-2xl"
        }
        onClick={() => setRating(star)}
        aria-label={`Valorar ${star} estrellas`}
      >
        ★
      </button>
    ))}
  </div>
);

const ClientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    appt: null,
  });
  const [reviewModal, setReviewModal] = useState({ open: false, appt: null });
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [clientReviews, setClientReviews] = useState([]);

  const handleCancel = async (appointment_id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4000/cancel-appointment/${appointment_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", token },
        }
      );
      if (res.ok) {
        // Actualizar la lista de citas después de cancelar
        const updated = await fetch("http://localhost:4000/my-appointments", {
          method: "GET",
          headers: { token },
        });
        const data = await updated.json();
        setAppointments(Array.isArray(data) ? data : []);
        toast.success("Cita cancelada correctamente");
      } else {
        toast.error("No se pudo cancelar la cita");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al cancelar la cita");
    }
  };

  const handleReview = async () => {
    if (!reviewModal.appt) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/review", {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({
          appointment_id: reviewModal.appt.appointment_id,
          comment: reviewComment,
          rating: reviewRating,
        }),
      });
      if (res.ok) {
        toast.success("Reseña enviada correctamente");
        setReviewModal({ open: false, appt: null });
        setReviewComment("");
        setReviewRating(0);
      } else {
        toast.error("No se pudo enviar la reseña");
      }
    } catch (error) {
      toast.error("Error al enviar la reseña");
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

  useEffect(() => {
    const fetchClientReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/client-reviews", {
          method: "GET",
          headers: { token },
        });
        const data = await res.json();
        setClientReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        setClientReviews([]);
      }
    };
    fetchClientReviews();
  }, []);

  // Helper para saber si una cita ya tiene reseña
  const hasReview = (appointment_id) => {
    return clientReviews.some(
      (review) => review.appointment_id === appointment_id
    );
  };

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
              className="bg-white border rounded-lg shadow p-4 relative"
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

                <div className="mt-4 flex gap-3 justify-end">
                  {appt.status !== "CANCELADA" && (
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 cursor-pointer"
                      onClick={() =>
                        setConfirm({ open: true, type: "reject", appt })
                      }
                    >
                      Cancelar
                    </button>
                  )}
                  {appt.status === "ACEPTADA" &&
                    !hasReview(appt.appointment_id) && (
                      <button
                        className="bg-yellow-400 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-500 cursor-pointer"
                        style={{ position: "absolute", bottom: 16, right: 16 }}
                        onClick={() => setReviewModal({ open: true, appt })}
                      >
                        Dejar una reseña
                      </button>
                    )}
                  {appt.status === "ACEPTADA" &&
                    hasReview(appt.appointment_id) && (
                      <span
                        className="bg-gray-300 text-white px-4 py-2 rounded-md font-semibold cursor-not-allowed"
                        style={{ position: "absolute", bottom: 16, right: 16 }}
                      >
                        Reseña enviada
                      </span>
                    )}
                </div>
                {/* Mostrar reseña si existe */}
                {hasReview(appt.appointment_id) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="font-semibold text-[#1E3A8A] mb-1">
                      Tu reseña:
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-400 text-xl">
                        {"★".repeat(
                          clientReviews.find(
                            (r) => r.appointment_id === appt.appointment_id
                          )?.rating || 0
                        )}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {clientReviews.find(
                          (r) => r.appointment_id === appt.appointment_id
                        )?.rating || 0}
                        /5
                      </span>
                    </div>
                    <div className="text-gray-700">
                      {
                        clientReviews.find(
                          (r) => r.appointment_id === appt.appointment_id
                        )?.comment
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-[#1E3A8A]">
              {confirm.type === "reject" ? "Cancelar Cita" : "x"}
            </h3>
            <p className="mt-2 text-gray-700">
              ¿Estás seguro que deseas{" "}
              {confirm.type === "reject" ? "CANCELAR" : "x"} esta cita?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-200 cursor-pointer"
                onClick={() =>
                  setConfirm({ open: false, type: null, appt: null })
                }
              >
                Cerrar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white cursor-pointer"
                onClick={() => {
                  setConfirm({ open: false, type: null, appt: null });
                  handleCancel(confirm.appt.appointment_id);
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-[#1E3A8A] mb-2">
              Dejar una reseña
            </h3>
            <StarRating rating={reviewRating} setRating={setReviewRating} />
            <textarea
              className="w-full mt-4 p-2 border rounded"
              rows={4}
              placeholder="Escribe tu comentario..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-200 cursor-pointer"
                onClick={() => {
                  setReviewModal({ open: false, appt: null });
                  setReviewComment("");
                  setReviewRating(0);
                }}
              >
                Cerrar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white cursor-pointer"
                onClick={handleReview}
                disabled={reviewRating === 0 || reviewComment.trim() === ""}
              >
                Enviar reseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAppointments;
