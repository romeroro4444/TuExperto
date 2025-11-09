import React, { useEffect, useState } from "react";

const ReviewsData = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = reviews.filter((r) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.client_rut || "").toLowerCase().includes(q) ||
      (r.professional_rut || "").toLowerCase().includes(q) ||
      (r.rating || "").toString().toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("http://localhost:4000/reviews");
        if (!res.ok) throw new Error("Error al obtener notificación");
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Lista de Reseñas
      </h1>
      {loading && <p className="text-sm text-gray-600">Cargando reseñas...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[80vh] overflow-y-auto mx-auto max-w-7xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por calificación o rut"
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
                  RUT Cliente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  RUT Profesional
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Calificación
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Comentario
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Fecha de Reseña
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.review_id}
                  className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                    {r.client_rut}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                    {r.professional_rut}
                  </td>
                  <td className="px-6 py-4 text-base">{r.rating}</td>
                  <td className="px-6 py-4 text-base">{r.comment}</td>
                  <td className="px-6 py-4 text-base">
                    {r.review_date
                      ? new Date(r.review_date).toLocaleString()
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

export default ReviewsData;
