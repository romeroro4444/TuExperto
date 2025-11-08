import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Report = () => {
  const location = useLocation();
  const [cita, setCita] = useState(null);
  const [form, setForm] = useState({
    date: "",
    title: "",
    description: "",
    file: null,
    reason: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("appointment_id", cita?.appointment_id);
    formData.append("service_id", cita?.service_id);
    formData.append("reason", form.reason);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("date_of_incident", form.date);
    if (form.file) formData.append("proof", form.file);
    fetch("http://localhost:4000/img/proof", {
      method: "POST",
      body: formData,
    });
    toast.success("Reporte enviado correctamente");
    setTimeout(() => {
      navigate("/client-appointments");
    }, 2000);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const appointmentId = params.get("appointment_id");
    if (appointmentId) {
      fetch(`http://localhost:4000/appointment/${appointmentId}`)
        .then((res) => res.json())
        .then((data) => setCita(data));
    }
  }, [location.search]);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Toaster position="top-right" />
      <h2 className="text-3xl font-bold mb-8 text-[#1E3A8A]">
        Realizar un Reclamo
      </h2>
      {cita && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="font-bold text-lg mb-2">Información del servicio</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div>
              <div className="text-sm text-gray-500">Titulo del Servicio</div>
              <div className="font-semibold">{cita.service_title}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">
                Nombre del Profesional
              </div>
              <div className="font-semibold">{cita.professional_name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Día Agendado</div>
              <div className="font-semibold">
                {new Date(cita.reservation_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
      {cita && (
        <form
          className="bg-white rounded-xl shadow p-6"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Id del Servicio
              </label>
              <input
                type="text"
                value={cita.appointment_id}
                disabled
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Día del Incidente
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Razón del Reclamo
            </label>
            <select
              name="reason"
              value={form.reason}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 mt-1"
            >
              <option value="">Selecciona una razón</option>
              <option value="Incumplimiento">Incumplimiento</option>
              <option value="Mal servicio">Mal servicio</option>
              <option value="Cobro incorrecto">Cobro incorrecto</option>
              <option value="No asistencia">No asistencia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Titulo del Reclamo
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Descripción del Reclamo
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 mt-1"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Sube evidencias del reclamo (OPCIONAL)
            </label>
            <input
              type="file"
              name="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          <button
            type="submit"
            className="bg-[#1E3A8A] text-white px-6 py-2 rounded font-semibold hover:bg-[#16306b] transition-colors w-full"
          >
            Enviar Reclamo
          </button>
        </form>
      )}
    </div>
  );
};

export default Report;
