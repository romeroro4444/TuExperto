import React, { useEffect, useState } from "react";

const ProfessionalsData = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = professionals.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.rut || "").toString().toLowerCase().includes(q) ||
      (p.name || "").toLowerCase().includes(q) ||
      (p.lastname || "").toLowerCase().includes(q) ||
      (p.profession_name || "").toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const res = await fetch("http://localhost:4000/professionals");
        if (!res.ok) throw new Error("Error al obtener usuarios");
        const data = await res.json();
        setProfessionals(data);
      } catch (err) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Lista de Profesionales
      </h1>
      {loading && <p className="text-sm text-gray-600">Cargando usuarios...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-[80vh] overflow-y-auto mx-auto max-w-6xl bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por RUT, nombre, apellido o prefesión"
              className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="text-sm text-gray-500">
              Resultados: {filtered.length}
            </div>
          </div>
          <table className="w-full text-base text-left text-gray-600">
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
                  Profesión
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
                  Verificado
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.professional_id}
                  className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                    {p.rut}
                  </td>
                  <td className="px-6 py-4 text-base">{p.name}</td>
                  <td className="px-6 py-4 text-base">{p.lastname}</td>
                  <td className="px-6 py-4 text-base">{p.profession_name}</td>
                  <td className="px-6 py-4 text-base">
                    {p.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-base">
                    {typeof p.verified === "boolean" ? (
                      p.verified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                          Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                          No
                        </span>
                      )
                    ) : p.verified != null ? (
                      String(p.verified)
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

export default ProfessionalsData;
