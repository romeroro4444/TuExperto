import React, { useEffect, useState } from "react";

const ComplaintsData = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    const fetchComplaints = async () => {
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
    fetchComplaints();
  }, []);

  const backendBase = "http://localhost:4000"; // ajustar si tu backend está en otra URL

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComplaintsData;
