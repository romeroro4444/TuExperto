import React, { useEffect, useState } from "react";

const RequestsData = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = requests.filter((r) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.rut || "").toString().toLowerCase().includes(q) ||
      (r.title || "").toLowerCase().includes(q) ||
      (r.profession_name || "").toLowerCase().includes(q)
    );
  });

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

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Lista de Solicitudes de Servicio
      </h1>
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
          <table className="w-full min-w-[1200px] text-base text-left text-gray-600">
            <thead className="text-sm text-gray-700 uppercase bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  RUT
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Apellido
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Titulo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Descripción
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Profesión
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Presupuesto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Fecha de Publicación
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
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
                    {r.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-base">{r.profession_name}</td>
                  <td className="px-6 py-4 text-base">{r.budget}</td>
                  <td className="px-6 py-4 text-base">
                    {r.publication_date
                      ? new Date(r.publication_date).toLocaleString()
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

export default RequestsData;
