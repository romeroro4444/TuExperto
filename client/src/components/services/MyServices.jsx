import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const MyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [state, setState] = useState([]);
  const [form, setForm] = useState({
    profession_id: "",
    description: "",
    price: "",
    modality: "",
    durationNumber: "",
    durationUnit: "horas",
  });

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
    const { name, value } = e.target;
    // 1000 caracteres limite de descripción
    if (name === "description") {
      setForm((prev) => ({ ...prev, description: value.slice(0, 1000) }));
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validation: all fields required
    if (
      !form.profession_id ||
      !form.description ||
      !form.price ||
      !form.modality ||
      !form.durationNumber
    ) {
      toast.error("Faltan datos por rellenar");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const profession = professions.find(
        (p) => String(p.profession_id) === String(form.profession_id)
      );
      const title = profession
        ? `Servicio de ${profession.profession_name}`
        : "Servicio";
      const duration = `${form.durationNumber} ${form.durationUnit}`;

      const payload = {
        title,
        description: form.description,
        price: form.price,
        modality: form.modality,
        duration,
        profession_id: form.profession_id,
      };

      const res = await fetch("http://localhost:4000/service", {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({
          profession_id: "",
          description: "",
          price: "",
          modality: "",
          durationNumber: "",
          durationUnit: "horas",
        });

        const newService = await res.json();
        setServices((prev) => [...prev, newService]);
        toast.success("Servicio publicado correctamente");
      } else {
        const err = await res.text();
        toast.error(`Error al publicar servicio: ${err}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error en la solicitud");
    }
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
      <Toaster />
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
            <div className="flex-1 min-w-[140px] sm:min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicio
              </label>
              <select
                name="profession_id"
                value={form.profession_id}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-md border border-gray-300"
              >
                <option value="">Seleccione una opción</option>
                {professions.map((p) => (
                  <option key={p.profession_id} value={p.profession_id}>
                    {`Servicio de ${p.profession_name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modalidad
              </label>
              <select
                name="modality"
                value={form.modality}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-md border border-gray-300"
              >
                <option value="">Seleccione modalidad</option>
                <option value="Presencial">Presencial</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div className="flex-1 min-w-[100px] sm:min-w-[120px] flex items-center gap-2">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración
                </label>
                <input
                  type="number"
                  min="1"
                  name="durationNumber"
                  value={form.durationNumber}
                  onChange={handleChange}
                  placeholder="Cantidad"
                  required
                  className="w-full p-2 rounded-md border border-gray-300"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1 invisible">
                  {" "}
                  Unidad{" "}
                </label>
                <select
                  name="durationUnit"
                  value={form.durationUnit}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border border-gray-300"
                >
                  <option value="horas">horas</option>
                  <option value="días">días</option>
                  <option value="semanas">semanas</option>
                </select>
              </div>
            </div>

            <div className="flex-1 min-w-[80px] sm:min-w-[100px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Precio"
                required
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>
          </div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            required
            maxLength={1000}
            className="w-full mt-2 p-2 rounded-md border border-gray-300"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {form.description.length}/1000
          </div>
          <button
            type="submit"
            className="mt-4 bg-[#1E3A8A] text-white rounded-full px-4 sm:px-6 py-2 font-semibold text-base hover:bg-[#233876] transition-colors w-full sm:w-auto"
          >
            Publicar servicio
          </button>
          <Toaster />
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
                  Activo
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
              {services.map((service) => {
                const st = service.status
                  ? String(service.status).toLowerCase()
                  : "";
                const isPending = st === "pending" || st === "pendiente";
                const isRejected = st === "rejected" || st === "rechazado";
                return (
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
                      {/* Moderation status */}
                      {(() => {
                        const st = service.status
                          ? String(service.status).toLowerCase()
                          : "";
                        if (st === "pending" || st === "pendiente") {
                          return (
                            <span className="rounded-full px-4 py-1 font-semibold text-sm bg-yellow-100 text-yellow-800">
                              Pendiente
                            </span>
                          );
                        }
                        if (st === "approved" || st === "aprobado") {
                          return (
                            <span className="rounded-full px-4 py-1 font-semibold text-sm bg-green-100 text-green-800">
                              Aprobado
                            </span>
                          );
                        }
                        if (st === "rejected" || st === "rechazado") {
                          return (
                            <span className="inline-flex items-center gap-2">
                              <span className="rounded-full px-4 py-1 font-semibold text-sm bg-red-100 text-red-800">
                                Rechazado
                              </span>
                              {service.rejection_reason ? (
                                <button
                                  onClick={() =>
                                    toast(service.rejection_reason, {
                                      duration: 8000,
                                    })
                                  }
                                  title="Ver motivo de rechazo"
                                  className="text-sm w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer"
                                >
                                  ?
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    toast("Sin motivo especificado", {
                                      duration: 8000,
                                    })
                                  }
                                  title="Ver motivo de rechazo"
                                  className="text-sm w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700"
                                >
                                  ?
                                </button>
                              )}
                            </span>
                          );
                        }
                        return (
                          <span className="rounded-full px-4 py-1 font-semibold text-sm bg-gray-100 text-gray-700">
                            N/A
                          </span>
                        );
                      })()}
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
                      {(() => {
                        const editDisabled = isPending || isRejected;
                        const activateDisabled =
                          service.active || isPending || isRejected;
                        const deactivateDisabled = !service.active || isPending;

                        return (
                          <>
                            <button
                              className={`font-medium mr-4 ${
                                editDisabled
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-[#1E3A8A] hover:underline"
                              }`}
                              onClick={() => {
                                if (editDisabled) {
                                  if (isPending) {
                                    toast.error(
                                      "Este servicio está pendiente de verificación por un administrador. No se puede editar por ahora.",
                                      { duration: 6000 }
                                    );
                                  } else if (isRejected) {
                                    const reason =
                                      service.rejection_reason ||
                                      "Sin motivo especificado";
                                    toast.error(
                                      `Este servicio fue rechazado: ${reason}`,
                                      { duration: 8000 }
                                    );
                                  }
                                  return;
                                }
                                navigate(`/edit-service/${service.service_id}`);
                              }}
                              disabled={editDisabled}
                              title={
                                editDisabled
                                  ? isPending
                                    ? "El servicio está pendiente de aprobación"
                                    : "El servicio fue rechazado"
                                  : "Editar servicio"
                              }
                            >
                              Editar
                            </button>

                            {service.active ? (
                              <button
                                className={`font-medium ${
                                  deactivateDisabled
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-orange-500 hover:underline"
                                }`}
                                onClick={() => {
                                  if (deactivateDisabled) {
                                    if (isPending) {
                                      toast.error(
                                        "No puedes cambiar el estado mientras el servicio está pendiente",
                                        { duration: 6000 }
                                      );
                                    }
                                    return;
                                  }
                                  handleDeactivate(service.service_id);
                                }}
                                disabled={deactivateDisabled}
                                title={
                                  deactivateDisabled
                                    ? isPending
                                      ? "El servicio está pendiente"
                                      : "No disponible"
                                    : "Desactivar servicio"
                                }
                              >
                                Desactivar
                              </button>
                            ) : (
                              <button
                                className={`font-medium ${
                                  activateDisabled
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-green-600 hover:underline"
                                } ml-0`}
                                onClick={() => {
                                  if (activateDisabled) {
                                    if (isPending) {
                                      toast.error(
                                        "No puedes activar este servicio hasta que un administrador lo apruebe.",
                                        { duration: 6000 }
                                      );
                                    } else if (isRejected) {
                                      const reason =
                                        service.rejection_reason ||
                                        "Sin motivo especificado";
                                      toast.error(
                                        `No puedes activar un servicio rechazado. Motivo: ${reason}`,
                                        { duration: 8000 }
                                      );
                                    }
                                    return;
                                  }
                                  handleActivate(service.service_id);
                                }}
                                disabled={activateDisabled}
                                title={
                                  activateDisabled
                                    ? isPending
                                      ? "El servicio está pendiente de aprobación"
                                      : "El servicio fue rechazado"
                                    : "Activar servicio"
                                }
                              >
                                Activar
                              </button>
                            )}

                            <button
                              className={`font-medium ml-2 ${
                                isPending
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-red-500 hover:underline"
                              }`}
                              onClick={() => {
                                if (isPending) {
                                  toast.error(
                                    "Este servicio está pendiente de verificación por un administrador. No se puede eliminar por ahora.",
                                    { duration: 6000 }
                                  );
                                  return;
                                }
                                handleDelete(service.service_id);
                              }}
                              disabled={isPending}
                              title={
                                isPending
                                  ? "No puedes eliminar un servicio pendiente"
                                  : "Eliminar servicio"
                              }
                            >
                              Eliminar
                            </button>
                          </>
                        );
                      })()}
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

export default MyServices;
