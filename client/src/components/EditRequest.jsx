import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditRequest = () => {
  const { request_id } = useParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    profession_name: "",
  });
  const [professions, setProfessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar profesiones
    const fetchProfessions = async () => {
      const res = await fetch("http://localhost:4000/professions");
      const data = await res.json();
      setProfessions(data);
    };
    fetchProfessions();
    // Cargar datos de la solicitud
    const fetchRequest = async () => {
      const res = await fetch(`http://localhost:4000/request/${request_id}`);
      const [data] = await res.json();
      setForm({
        title: data.title,
        description: data.description,
        budget: data.budget,
        profession_name: data.profession_name,
      });
    };
    fetchRequest();
  }, [request_id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // busca el profession_id por nombre
      const selectedProfession = professions.find(
        (p) => p.profession_name === form.profession_name
      );
      const profession_id = selectedProfession
        ? selectedProfession.profession_id
        : null;
      const res = await fetch(`http://localhost:4000/request/${request_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          budget: form.budget,
          profession_id,
        }),
      });
      if (res.ok) {
        navigate("/mis-solicitudes");
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h2 className="text-2xl font-bold text-[#1E3A8A] mb-6">
        Editar Solicitud
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Título"
          required
          className="p-2 rounded-md border border-gray-300"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción"
          required
          className="p-2 rounded-md border border-gray-300"
        />
        <input
          type="number"
          name="budget"
          value={form.budget}
          onChange={handleChange}
          placeholder="Presupuesto"
          required
          className="p-2 rounded-md border border-gray-300"
        />
        <select
          name="profession_name"
          value={form.profession_name}
          onChange={handleChange}
          required
          className="p-2 rounded-md border border-gray-300"
        >
          <option value="">Selecciona Profesión</option>
          {professions.map((prof) => (
            <option key={prof.profession_id} value={prof.profession_name}>
              {prof.profession_name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="mt-4 bg-[#1E3A8A] text-white rounded-full px-6 py-2 font-semibold text-base hover:bg-[#233876] transition-colors"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EditRequest;
