import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const EditService = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    modality: "",
    duration: "",
    service_id: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { service_id } = useParams();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/service/${service_id}`, {
          method: "GET",
          headers: { token },
        });
        const data = await res.json();
        if (data && data.service_id) {
          setForm({
            title: data.title || "",
            description: data.description || "",
            price: data.price || "",
            modality: data.modality || "",
            duration: data.duration || "",
            service_id: data.service_id,
          });
        }
      } catch (err) {
        toast.error("Error al cargar el servicio");
      } finally {
        setLoading(false);
      }
    };
    if (service_id) fetchService();
  }, [service_id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4000/service/${form.service_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", token },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            price: form.price,
            modality: form.modality,
            duration: form.duration,
          }),
        }
      );
      if (res.ok) {
        toast.success("Servicio editado correctamente");
        navigate("/mis-servicios");
      } else {
        toast.error("Error al editar el servicio");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  if (loading) {
    return <div className="text-[#1E3A8A]">Cargando servicio...</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-[#1E3A8A] mb-6 text-center">
        Editar Servicio
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block font-semibold">Titulo</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Título"
          required
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
        <label className="block font-semibold">Descripción</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción"
          required
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
        <label className="block font-semibold">Precio</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Precio"
          required
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
        <label className="block font-semibold">Modalidad</label>
        <input
          type="text"
          name="modality"
          value={form.modality}
          onChange={handleChange}
          placeholder="Modalidad"
          required
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
        <label className="block font-semibold">Duración</label>
        <input
          type="text"
          name="duration"
          value={form.duration}
          onChange={handleChange}
          placeholder="Duración"
          required
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
        <button
          type="submit"
          className="w-full bg-[#FE7743] text-white font-semibold rounded-full py-3 text-base hover:bg-[#E56332] transition-colors"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};
export default EditService;
