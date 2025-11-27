import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:4000/audit");
        if (!res.ok) throw new Error("Error al obtener logs");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (String(l.audit_id) || "").toLowerCase().includes(q) ||
      (l.user_id || "").toLowerCase().includes(q) ||
      (l.affected_table || "").toLowerCase().includes(q) ||
      (l.action || "").toLowerCase().includes(q) ||
      (l.description || "").toLowerCase().includes(q)
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
      {loading && <p className="text-sm text-gray-600">Cargando logs...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[70vh] overflow-y-auto mx-auto max-w-7xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por id, user_id, tabla, acción, descripción"
              className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="text-sm text-gray-500">
              Resultados: {filtered.length}
            </div>
          </div>

          <table className="w-full min-w-[1100px] text-base text-left text-gray-600">
            <thead className="text-sm text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  ID
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  User ID
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Tabla
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Registro Afectado
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Acción
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Descripción
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-700">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.audit_id}
                  className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                    {l.audit_id}
                  </td>
                  <td className="px-6 py-4 text-base break-words">
                    {l.user_id || "-"}{" "}
                  </td>
                  <td className="px-6 py-4 text-base">{l.affected_table}</td>
                  <td className="px-6 py-4 text-base">
                    {l.affected_record_id}
                  </td>
                  <td className="px-6 py-4 text-base">{l.action}</td>
                  <td className="px-6 py-4 text-base">
                    <span
                      title={l.description || "-"}
                      className="block max-w-[48ch] break-words"
                    >
                      {l.description ? truncateWords(l.description, 25) : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-base">
                    {l.event_date
                      ? new Date(l.event_date).toLocaleString()
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

export default Dashboard;
