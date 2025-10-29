import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [state, setState] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    modality: "",
    duration: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/service", {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({
          title: "",
          description: "",
          price: "",
          modality: "",
          duration: "",
        });

        const newService = await res.json();
        setServices((prev) => [...prev, newService]);
      }
    } catch (err) {}
  };

  const handleDeactivate = async (service_id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4000/service/${service_id}/deactivate`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", token },
        }
      );
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) =>
            s.service_id === service_id ? { ...s, active: false } : s
          )
        );
        setState((prev) =>
          prev.map((v, i) =>
            services[i].service_id === service_id ? false : v
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleActivate = async (service_id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:4000/service/${service_id}/activate`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", token },
        }
      );
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) =>
            s.service_id === service_id ? { ...s, active: true } : s
          )
        );
        setState((prev) =>
          prev.map((v, i) => (services[i].service_id === service_id ? true : v))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleDelete = async (service_id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/service/${service_id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", token },
      });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.service_id !== service_id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchMyServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/my-services", {
          method: "GET",
          headers: { token },
        });
        const data = await res.json();
        setServices(data);
        setState(data.map((s) => !!s.active));
      } catch (err) {
        setServices([]);
        setState([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyServices();
  }, []);

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-8 lg:p-12 mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
          Gestionar Servicios
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#FE7743] text-white rounded-full px-4 sm:px-6 py-2 font-semibold text-base hover:bg-[#E56332] transition-colors w-full sm:w-auto"
        >
          {showForm ? "Cancelar" : "Crear nuevo servicio"}
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
              type="text"
              name="modality"
              value={form.modality}
              onChange={handleChange}
              placeholder="Modalidad"
              required
              className="flex-1 min-w-[100px] sm:min-w-[120px] p-2 rounded-md border border-gray-300"
            />
            <input
              type="text"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="Duración"
              required
              className="flex-1 min-w-[100px] sm:min-w-[120px] p-2 rounded-md border border-gray-300"
            />
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Precio"
              required
              className="flex-1 min-w-[80px] sm:min-w-[100px] p-2 rounded-md border border-gray-300"
            />
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
            Publicar servicio
          </button>
        </form>
      )}
      <h3 className="text-lg sm:text-xl font-semibold text-[#1E3A8A] mb-3">
        Servicios activos
      </h3>
      {loading ? (
        <p className="text-[#1E3A8A]">Cargando servicios...</p>
      ) : services.length === 0 ? (
        <p className="text-[#FE7743]">No tienes servicios publicados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold">
                  Servicio
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold">
                  Oficio
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold">
                  Estado
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold">
                  Precio
                </th>
                <th className="py-3 px-2 text-[#1E3A8A] font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr
                  key={service.service_id}
                  className="border-b border-gray-200"
                >
                  <td className="py-2 px-2">
                    <div className="font-semibold text-[#1E3A8A]">
                      {service.title}
                    </div>
                    <div className="text-sm text-gray-700 break-words max-w-xs whitespace-pre-line">
                      {service.description}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-[#FE7743] font-medium">
                    {service.profession_name}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`rounded-full px-4 py-1 font-semibold text-sm ${
                        service.active
                          ? "bg-blue-100 text-[#1E3A8A]"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {service.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-2 px-2 font-semibold text-[#1E3A8A]">
                    ${service.price}
                  </td>
                  <td className="py-2 px-2">
                    <button
                      className="text-[#1E3A8A] font-medium hover:underline mr-4"
                      onClick={() =>
                        navigate(`/edit-service/${service.service_id}`)
                      }
                    >
                      Editar
                    </button>
                    {service.active ? (
                      <button
                        className="text-orange-500 font-medium hover:underline cursor-pointer"
                        onClick={() => handleDeactivate(service.service_id)}
                        disabled={!service.active}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="text-green-600 font-medium hover:underline cursor-pointer"
                        onClick={() => handleActivate(service.service_id)}
                        disabled={service.active}
                      >
                        Activar
                      </button>
                    )}
                    <button
                      className="text-red-500 font-medium hover:underline cursor-pointer ml-2"
                      onClick={() => handleDelete(service.service_id)}
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

export default MyServices;
