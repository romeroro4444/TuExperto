import React, { useEffect, useState } from "react";

const NoitificationsData = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = notifications.filter((n) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (n.notification_type || "").toLowerCase().includes(q) ||
      (n.recipient_email || "").toLowerCase().includes(q) ||
      (n.sent_status || "").toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:4000/notifications");
        if (!res.ok) throw new Error("Error al obtener notificación");
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Lista de Notificaciones
      </h1>
      {loading && (
        <p className="text-sm text-gray-600">Cargando notificaciones...</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[80vh] overflow-y-auto mx-auto max-w-7xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por tipo, email o estado"
              className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="text-sm text-gray-500">
              Resultados: {filtered.length}
            </div>
          </div>
          <table className="w-full min-w-[1200px] text-base text-left text-gray-600">
            <thead className="text-sm text-gray-700 uppercase bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Tipo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Email de Recepción
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Asunto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Mensaje
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Fecha de Envío
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr
                  key={n.notification_id}
                  className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                    {n.notification_type}
                  </td>
                  <td className="px-6 py-4 text-base">{n.recipient_email}</td>
                  <td className="px-6 py-4 text-base">{n.subject}</td>
                  <td className="px-6 py-4 text-base">{n.mesagge}</td>
                  <td className="px-6 py-4 text-base">
                    {n.date_sent ? new Date(n.date_sent).toLocaleString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-base">{n.sent_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NoitificationsData;
