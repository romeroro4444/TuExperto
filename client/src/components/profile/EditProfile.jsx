import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EditProfile = ({ tipo_usuario }) => {
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    telefono: "",
    description: "",
    profession_id: "",
  });
  const [professions, setProfessions] = useState([]);
  // Cargar profesiones solo si es profesional
  useEffect(() => {
    if (tipo_usuario === "PROFESIONAL") {
      const fetchProfessions = async () => {
        try {
          const res = await fetch("http://localhost:4000/professions");
          const data = await res.json();
          setProfessions(data);
        } catch (err) {}
      };
      fetchProfessions();
    }
  }, [tipo_usuario]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        let url =
          tipo_usuario === "PROFESIONAL"
            ? "http://localhost:4000/profile"
            : "http://localhost:4000/profile-client";
        const res = await fetch(url, {
          method: "GET",
          headers: { token },
        });
        const data = await res.json();
        if (data && data.user) {
          setForm({
            name: data.user.name || "",
            lastname: data.user.lastname || "",
            telefono: data.user.telefono || "",
            description:
              tipo_usuario === "PROFESIONAL" && data.professional
                ? data.professional.description || ""
                : undefined,
            profession_id:
              tipo_usuario === "PROFESIONAL" && data.professional
                ? data.professional.profession_id || ""
                : undefined,
          });
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [tipo_usuario]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let url =
        tipo_usuario === "PROFESIONAL"
          ? "http://localhost:4000/profile"
          : "http://localhost:4000/profile-client";
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Perfil actualizado correctamente");
        setTimeout(() => navigate("/profile"), 1200);
      } else {
        toast.error(data.message || "Error al actualizar perfil");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  if (loading) return <div className="text-center mt-8">Cargando...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6">Editar Perfil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nombre</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Apellido</label>
          <input
            type="text"
            name="lastname"
            value={form.lastname}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        {tipo_usuario === "PROFESIONAL" && form.description !== undefined && (
          <div>
            <label className="block font-semibold mb-1">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        )}
        {tipo_usuario === "PROFESIONAL" && form.profession_id !== undefined && (
          <div>
            <label className="block font-semibold mb-1">Oficio</label>
            <select
              name="profession_id"
              value={form.profession_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Elige un Oficio</option>
              {professions.map((prof) => (
                <option key={prof.profession_id} value={prof.profession_id}>
                  {prof.profession_name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="submit"
          className="bg-[#1E3A8A] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#16306b] transition-colors"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
