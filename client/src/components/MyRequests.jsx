import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    professions: [],
  });
  const [professionsList, setProfessionsList] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === "select-multiple") {
      const values = Array.from(selectedOptions, (opt) => opt.value);
      setForm({ ...form, [name]: values });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // busca los profession_id por nombre
      const selectedIds = professionsList
        .filter((p) => form.professions.includes(p.profession_name))
        .map((p) => p.profession_id);
      for (const profession_id of selectedIds) {
        const res = await fetch("http://localhost:4000/request", {
          method: "POST",
          headers: { "Content-Type": "application/json", token },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            budget: form.budget,
            profession_id,
          }),
        });
        if (res.ok) {
          setShowForm(false);
          setForm({
            title: "",
            description: "",
            budget: "",
            professions: [],
          });
          const newRequest = await res.json();
          setRequests((prev) => [...prev, newRequest.body]);
        }
      }
    } catch (err) {}
  };

  const handleDelete = async (request_id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/request/${request_id}`, {
        method: "DELETE",
        headers: { token },
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.request_id !== request_id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/my-requests", {
          method: "GET",
          headers: { token },
        });
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchProfessions = async () => {
      const res = await fetch("http://localhost:4000/professions");
      const data = await res.json();
      setProfessionsList(data);
    };
    fetchMyRequests();
    fetchProfessions();
  }, []);
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-8 lg:p-12 mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
          Gestionar Solicitudes
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#FE7743] text-white rounded-full px-4 sm:px-6 py-2 font-semibold text-base hover:bg-[#E56332] transition-colors w-full sm:w-auto"
        >
          {showForm ? "Cancelar" : "Crear nueva solicitud"}
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 p-4 sm:p-6 rounded-lg mb-8"
        >
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-4">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Título"
              required
              className="flex-1 min-w-[140px] sm:min-w-[180px] p-2 rounded-md border border-gray-300"
            />
            <input
              type="number"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              placeholder="Presupuesto"
              required
              className="flex-1 min-w-[80px] sm:min-w-[100px] p-2 rounded-md border border-gray-300"
            />
            <select
              name="professions"
              multiple
              value={form.professions}
              onChange={handleChange}
              required
              className="flex-1 min-w-[120px] p-2 rounded-md border border-gray-300"
            >
              {professionsList.map((prof) => (
                <option key={prof.profession_id} value={prof.profession_name}>
                  {prof.profession_name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            required
            className="w-full mt-2 p-2 rounded-md border border-gray-300"
          />
          <button
            type="submit"
            className="mt-4 bg-[#1E3A8A] text-white rounded-full px-4 sm:px-6 py-2 font-semibold text-base hover:bg-[#233876] transition-colors w-full sm:w-auto"
          >
            Publicar solicitud
          </button>
        </form>
      )}
      <h3 className="text-lg sm:text-xl font-semibold text-[#1E3A8A] mb-3">
        Mis solicitudes
      </h3>
      {loading ? (
        <p className="text-[#1E3A8A]">Cargando solicitudes...</p>
      ) : requests.length === 0 ? (
        <p className="text-[#FE7743]">No tienes solicitudes publicadas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold">
                  Título
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold">
                  Profesión
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold">
                  Presupuesto
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.request_id}
                  className="border-b border-gray-200"
                >
                  <td className="py-2 px-2">
                    <div className="font-semibold text-[#1E3A8A]">
                      {request.title}
                    </div>
                    <div className="text-sm text-gray-700 break-words max-w-xs whitespace-pre-line">
                      {request.description}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-[#FE7743] font-medium">
                    {request.profession_name}
                  </td>
                  <td className="py-2 px-2 font-semibold text-[#1E3A8A]">
                    ${request.budget}
                  </td>
                  <td className="py-2 px-2 flex gap-2">
                    <button
                      className="text-blue-600 font-medium hover:underline cursor-pointer"
                      onClick={() =>
                        navigate(`/edit-request/${request.request_id}`)
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-500 font-medium hover:underline cursor-pointer"
                      onClick={() => handleDelete(request.request_id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
