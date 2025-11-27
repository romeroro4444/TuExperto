import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    professions: "",
  });
  const [professionsList, setProfessionsList] = useState([]);
  const professions = [
    { profession_id: 1, profession_name: "PINTOR/A" },
    { profession_id: 2, profession_name: "CARPINTERO/A" },
    { profession_id: 3, profession_name: "CERRAJERO/A" },
    { profession_id: 4, profession_name: "RELOJERO/A" },
    { profession_id: 5, profession_name: "JARDINERO/A" },
    { profession_id: 7, profession_name: "OBRERO/A" },
    { profession_id: 6, profession_name: "ALBANIL" },
    { profession_id: 17, profession_name: "MECANICO/A" },
    { profession_id: 18, profession_name: "GASFITER" },
    { profession_id: 19, profession_name: "SOLDADOR" },
    { profession_id: 20, profession_name: "SASTRE" },
    { profession_id: 21, profession_name: "CHOFER" },
    { profession_id: 22, profession_name: "ZAPATERO" },
    { profession_id: 23, profession_name: "HERRERO" },
    { profession_id: 24, profession_name: "ARTESANO/A" },
    { profession_id: 25, profession_name: "BARBERO/A" },
    { profession_id: 26, profession_name: "FUMIGADOR/A" },
  ];
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === "select-multiple") {
      const values = Array.from(selectedOptions, (opt) => opt.value);
      setForm({ ...form, [name]: values });
    } else {
      // Limit description to 1000 characters
      if (name === "description") {
        setForm({ ...form, description: value.slice(0, 1000) });
        return;
      }
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // support single selection (string id) or multiple selection (array)
      let selectedIds = [];
      if (Array.isArray(form.professions)) {
        selectedIds = form.professions.map((v) => Number(v));
      } else if (form.professions) {
        selectedIds = [Number(form.professions)];
      }

      for (const profession_id of selectedIds) {
        // find profession name to build title
        const prof = professions.find(
          (p) => Number(p.profession_id) === Number(profession_id)
        );
        const title = prof
          ? `Solicitud de Servicio de ${prof.profession_name}`
          : form.title || "Solicitud de Servicio";

        const res = await fetch("http://localhost:4000/request", {
          method: "POST",
          headers: { "Content-Type": "application/json", token },
          body: JSON.stringify({
            title,
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
            professions: "",
          });
          const newRequest = await res.json();
          setRequests((prev) => [...prev, newRequest.body || newRequest]);
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
      <Toaster />
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
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicio
              </label>
              <select
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-md border border-gray-300 bg-white"
              >
                <option value="">Seleccione una opción</option>
                {professions.map((p) => (
                  <option key={p.profession_id} value={p.profession_id}>
                    {`Solicitud Servicio de ${p.profession_name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto
              </label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="Presupuesto"
                min="0"
                required
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profesión Solicitada
              </label>
              <select
                name="professions"
                value={form.professions}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-md border border-gray-300 bg-white"
              >
                <option value="">Seleccione una opción</option>
                {professions.map((p) => (
                  <option key={p.profession_id} value={p.profession_id}>
                    {p.profession_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            required
            maxLength={1000}
            className="w-full mt-2 p-2 rounded-md border border-gray-300 resize-vertical"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {form.description.length}/1000
          </div>
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
          <table className="min-w-[900px] w-full table-fixed border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold w-72">
                  Título
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold w-36">
                  Profesión
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold w-28">
                  Presupuesto
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold w-36">
                  Estado
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const status = request.status || request.estado || "N/A";
                const isPending = /pend/i.test(status);
                const isRejected = /rech/i.test(status);
                const rejection =
                  request.rejection_reason || request.motivo_rechazo || "";

                return (
                  <tr
                    key={request.request_id}
                    className="border-b border-gray-200"
                  >
                    <td className="py-2 px-2 w-72">
                      <div className="font-semibold text-[#1E3A8A]">
                        {request.title}
                      </div>
                      <div className="text-sm text-gray-700 truncate max-w-xs whitespace-pre-line">
                        {request.description}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-[#FE7743] font-medium w-36">
                      {request.profession_name}
                    </td>
                    <td className="py-2 px-2 font-semibold text-[#1E3A8A] w-28">
                      ${request.budget}
                    </td>
                    <td className="py-2 px-2 flex items-center gap-2 w-36">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          isPending
                            ? "bg-yellow-100 text-yellow-800"
                            : isRejected
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {status}
                      </span>
                      {isRejected ? (
                        <button
                          onClick={() =>
                            toast(rejection || "Sin motivo especificado", {
                              duration: 5000,
                            })
                          }
                          title={rejection || "Sin motivo especificado"}
                          className="text-sm w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer"
                        >
                          ?
                        </button>
                      ) : null}
                    </td>
                    <td className="py-2 px-2">
                      <button
                        className={`font-medium mr-4 ${
                          isPending || isRejected
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-[#1E3A8A] hover:underline"
                        }`}
                        onClick={() => {
                          if (isPending) {
                            toast.error(
                              "No puedes editar una solicitud pendiente"
                            );
                            return;
                          }
                          if (isRejected) {
                            const reason =
                              rejection || "Sin motivo especificado";
                            toast.error(
                              `Esta solicitud fue rechazada: ${reason}`
                            );
                            return;
                          }
                          navigate(`/edit-request/${request.request_id}`);
                        }}
                        disabled={isPending || isRejected}
                      >
                        Editar
                      </button>
                      <button
                        className={`font-medium ml-2 ${
                          isPending
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-500 hover:underline"
                        }`}
                        onClick={() => {
                          if (isPending) {
                            toast.error(
                              "No puedes eliminar una solicitud pendiente"
                            );
                            return;
                          }
                          handleDelete(request.request_id);
                        }}
                        disabled={isPending}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
