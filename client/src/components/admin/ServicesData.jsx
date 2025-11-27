import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const DecisionButton = ({ service, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState("");

  const token = localStorage.getItem("token");

  const openModal = () => {
    setReason("");
    setShowRejectInput(false);
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  const doApprove = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/service/${service.service_id}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", token },
        }
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success("Servicio aprobado");
      onUpdate({
        service_id: service.service_id,
        status: "Aprobado",
        rejection_reason: null,
      });
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Error al aprobar servicio");
    }
  };

  const doReject = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/service/${service.service_id}/reject`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", token },
          body: JSON.stringify({ reason }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success("Servicio rechazado");
      onUpdate({
        service_id: service.service_id,
        status: "Rechazado",
        rejection_reason: reason,
      });
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Error al rechazar servicio");
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
      >
        Tomar decisión
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={closeModal}
          />
          <div className="bg-white rounded-lg shadow-lg z-60 max-w-2xl w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">
              Decisión - Servicio #{service.service_id}
            </h3>
            <div className="text-sm text-gray-700 mb-4">
              <div className="font-medium">Título:</div>
              <div className="mb-2">{service.title}</div>
              <div className="font-medium">Profesión:</div>
              <div className="mb-2">{service.profession_name}</div>
              <div className="font-medium">Descripción:</div>
              <div className="mb-3 whitespace-pre-wrap">
                {service.description}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Precio</div>
                  <div>{service.price}</div>
                </div>
                <div>
                  <div className="font-medium">Modalidad</div>
                  <div>{service.modality}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={doApprove}
                className="bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Aprobar
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Rechazar
              </button>
              <button
                onClick={closeModal}
                className="ml-auto px-4 py-2 rounded-md border"
              >
                Cerrar
              </button>
            </div>

            {showRejectInput && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Motivo de rechazo
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                  rows={4}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-1 rounded-md border"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={doReject}
                    className="px-3 py-1 rounded-md bg-red-600 text-white"
                  >
                    Confirmar rechazo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const ServicesData = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:4000/services");
        if (!res.ok) throw new Error("Error al obtener servicios");
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filtered = services.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.rut || "").toString().toLowerCase().includes(q) ||
      (s.title || "").toLowerCase().includes(q) ||
      (s.profession_name || "").toLowerCase().includes(q)
    );
  });

  const truncateWords = (text = "", numWords = 25) => {
    const str = String(text || "");
    const words = str.split(/\s+/).filter(Boolean);
    if (words.length <= numWords) return str;
    return words.slice(0, numWords).join(" ") + "...";
  };

  return (
    <div className="w-full">
      <Toaster />
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Lista de Servicios
      </h1>
      {loading && (
        <p className="text-sm text-gray-600">Cargando servicios...</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[80vh] overflow-y-auto mx-auto max-w-7xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por RUT, titulo o profesión"
              className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="text-sm text-gray-500">
              Resultados: {filtered.length}
            </div>
          </div>

          <table className="w-full min-w-[1200px] text-base text-left text-gray-600">
            <thead className="text-sm text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  RUT
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Titulo
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Descripción
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Profesión
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Precio
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Modalidad
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Duración
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Activo
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Estado
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Decisión
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Fecha de Publicación
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.service_id}
                  className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                    {s.rut}
                  </td>
                  <td className="px-6 py-4 text-base">{s.title}</td>
                  <td className="px-6 py-4 text-base">
                    <span
                      title={s.description || "-"}
                      className="block max-w-[48ch] break-words"
                    >
                      {s.description ? truncateWords(s.description, 25) : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-base">{s.profession_name}</td>
                  <td className="px-6 py-4 text-base">{s.price}</td>
                  <td className="px-6 py-4 text-base">{s.modality}</td>
                  <td className="px-6 py-4 text-base">{s.duration}</td>
                  <td className="px-6 py-4 text-base">
                    {typeof s.active === "boolean" ? (
                      s.active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                          Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                          No
                        </span>
                      )
                    ) : s.active != null ? (
                      String(s.active)
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-base">
                    {/* Estado (pendiente / aprobado / rechazado) */}
                    {(() => {
                      const st = s.status ? String(s.status).toLowerCase() : "";
                      if (st === "pending" || st === "pendiente")
                        return (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                            Pendiente
                          </span>
                        );
                      if (st === "approved" || st === "aprobado")
                        return (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                            Aprobado
                          </span>
                        );
                      if (st === "rejected" || st === "rechazado")
                        return (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                            Rechazado
                          </span>
                        );
                      return (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                          N/A
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-base">
                    <DecisionButton
                      service={s}
                      onUpdate={(updated) => {
                        setServices((prev) =>
                          prev.map((it) =>
                            it.service_id === updated.service_id
                              ? { ...it, ...updated }
                              : it
                          )
                        );
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-base">
                    {s.publication_date
                      ? new Date(s.publication_date).toLocaleString()
                      : "-"}
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

export default ServicesData;
