import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

// DecisionButton for requests
const DecisionButton = ({ request, onUpdate }) => {
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
        `http://localhost:4000/request/${request.request_id}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", token },
        }
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success("Solicitud aprobada");
      onUpdate({
        request_id: request.request_id,
        status: "Aprobado",
        rejection_reason: null,
      });
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Error al aprobar solicitud");
    }
  };

  const doReject = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/request/${request.request_id}/reject`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", token },
          body: JSON.stringify({ reason }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success("Solicitud rechazada");
      onUpdate({
        request_id: request.request_id,
        status: "Rechazado",
        rejection_reason: reason,
      });
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Error al rechazar solicitud");
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
              Decisión - Solicitud #{request.request_id}
            </h3>
            <div className="text-sm text-gray-700 mb-4">
              <div className="font-medium">Título:</div>
              <div className="mb-2">{request.title}</div>
              <div className="font-medium">Profesión:</div>
              <div className="mb-2">{request.profession_name}</div>
              <div className="font-medium">Descripción:</div>
              <div className="mb-3 whitespace-pre-wrap break-words max-h-40 overflow-auto">
                {request.description}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Presupuesto</div>
                  <div>{request.budget}</div>
                </div>
                <div>
                  <div className="font-medium">Usuario</div>
                  <div>
                    {request.name} {request.lastname}
                  </div>
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

const RequestsData = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:4000/requests");
        if (!res.ok) throw new Error("Error al obtener solicitud");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filtered = requests.filter((r) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.rut || "").toString().toLowerCase().includes(q) ||
      (r.title || "").toLowerCase().includes(q) ||
      (r.profession_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Lista de Solicitudes de Servicio
      </h1>
      <Toaster />
      {loading && (
        <p className="text-sm text-gray-600">Cargando solicitudes...</p>
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

          <table className="w-full table-fixed text-base text-left text-gray-600">
            <thead className="text-sm text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  RUT
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Nombre
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Apellido
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Titulo
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700 w-72">
                  Descripción
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Profesión
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Presupuesto
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
              {filtered.map((r) => {
                const st = r.status ? String(r.status).toLowerCase() : "";
                const isPending = st === "pending" || st === "pendiente";
                const isRejected = st === "rejected" || st === "rechazado";
                return (
                  <tr
                    key={r.request_id}
                    className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                      {r.rut}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                      {r.name}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                      {r.lastname}
                    </td>
                    <td className="px-6 py-4 text-base">{r.title}</td>
                    <td className="px-6 py-4 text-base">
                      {r.description ? (
                        <span
                          title={r.description}
                          className="block max-w-full truncate"
                        >
                          {r.description}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-base">{r.profession_name}</td>
                    <td className="px-6 py-4 text-base">{r.budget}</td>
                    <td className="px-6 py-4 text-base">
                      {(() => {
                        if (isPending)
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
                        if (isRejected)
                          return (
                            <span className="inline-flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                                Rechazado
                              </span>
                              <button
                                onClick={() =>
                                  toast(
                                    r.rejection_reason ||
                                      "Sin motivo especificado",
                                    { duration: 8000 }
                                  )
                                }
                                className="text-sm w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700"
                              >
                                ?
                              </button>
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
                        request={r}
                        onUpdate={(u) =>
                          setRequests((prev) =>
                            prev.map((it) =>
                              it.request_id === u.request_id
                                ? { ...it, ...u }
                                : it
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-6 py-4 text-base">
                      {r.publication_date
                        ? new Date(r.publication_date).toLocaleString()
                        : "-"}
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

export default RequestsData;
