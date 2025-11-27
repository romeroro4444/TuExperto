import React, { useEffect, useState } from "react";

const ComplaintsData = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    appt: null,
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = complaints.filter((c) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.client_rut || "").toLowerCase().includes(q) ||
      (c.professional_rut || "").toLowerCase().includes(q) ||
      (c.title || "").toLowerCase().includes(q) ||
      (c.reason || "").toLowerCase().includes(q) ||
      (c.claim_status || "").toLowerCase().includes(q)
    );
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/complaints");
      if (!res.ok) throw new Error("Error al obtener reclamos");
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const backendBase = "http://localhost:4000";

  const handleDecision = async (decision) => {
    if (!selectedComplaint) return;
    setIsProcessing(true);
    try {
      const payload = {
        decision,
        comment: decisionComment || null,
      };
      const res = await fetch(
        `${backendBase}/complaints/${selectedComplaint.complaint_id}/decision`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al enviar decisión");
      }
      const data = await res.json();
      // actualizar estado local: reemplazar complaint actualizado
      const updated = data.complaint;
      if (updated) {
        setComplaints((prev) =>
          prev.map((item) =>
            item.complaint_id === updated.complaint_id ? updated : item
          )
        );
      } else {
        // si no viene complaint, refetch por seguridad
        await fetchComplaints();
      }
      // cerrar modal y reset
      setSelectedComplaint(null);
      setDecisionComment("");
      // opcional: mostrar mensaje al usuario
      // alert(data.message || 'Decisión registrada');
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al enviar decisión");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Lista de Reclamos
      </h1>
      {loading && <p className="text-sm text-gray-600">Cargando reclamos...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[80vh] overflow-y-auto mx-auto max-w-7xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por RUT cliente/profesional, título o estado"
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
                  RUT Cliente
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  RUT Profesional
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Título
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Descripción
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Motivo
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Estado
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Fecha Incidente
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Evidencia
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Decisión
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.complaint_id}
                  className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                    {c.client_rut}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                    {c.professional_rut}
                  </td>
                  <td className="px-6 py-4 text-base">{c.title}</td>
                  <td className="px-6 py-4 text-base">{c.description}</td>
                  <td className="px-6 py-4 text-base">{c.reason}</td>
                  <td className="px-6 py-4 text-base">{c.claim_status}</td>
                  <td className="px-6 py-4 text-base">
                    {c.date_of_incident
                      ? new Date(c.date_of_incident).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-base">
                    {c.evidence ? (
                      <a
                        href={`${backendBase}/complaints/${c.complaint_id}/evidence`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver / Descargar
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-base">
                    <div className="flex items-center justify-center">
                      <button
                        className="bg-[#FE7743] text-white rounded-full px-4 py-2 font-semibold hover:bg-[#E56332] transition-colors inline-block shadow-lg text-sm cursor-pointer"
                        onClick={() => setSelectedComplaint(c)}
                      >
                        Tomar Decisión
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-[#1E3A8A] mb-2">
              Toma una decisión
            </h3>
            <p className="font-semibold">ID CITA</p>
            <p className="mb-2">{selectedComplaint.appointment_id || "-"}</p>
            <p className="font-semibold">Título</p>
            <p className="mb-2">{selectedComplaint.title || "-"}</p>
            <p className="font-semibold">Descripción</p>
            <p className="mb-2">{selectedComplaint.description || "-"}</p>
            <textarea
              className="w-full mt-4 p-2 border rounded"
              rows={4}
              placeholder="Escribe tu comentario sobre la decisión..."
              value={decisionComment}
              onChange={(e) => setDecisionComment(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-200 cursor-pointer"
                onClick={() => {
                  setSelectedComplaint(null);
                  setDecisionComment("");
                }}
                disabled={isProcessing}
              >
                Cerrar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-red-600 text-white cursor-pointer disabled:opacity-60"
                onClick={() => handleDecision("RECHAZADO")}
                disabled={isProcessing}
              >
                RECHAZAR
              </button>
              <button
                className="px-4 py-2 rounded-md bg-green-600 text-white cursor-pointer disabled:opacity-60"
                onClick={() => handleDecision("APROBADO")}
                disabled={isProcessing}
              >
                APROBAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsData;
