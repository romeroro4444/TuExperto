import React, { useEffect, useState } from "react";

const UsersData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = users.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.rut || "").toString().toLowerCase().includes(q) ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.lastname || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:4000/users");
        if (!res.ok) throw new Error("Error al obtener usuarios");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Lista de Usuarios
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
              placeholder="Buscar por RUT, nombre, apellido o email..."
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
                  Email
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Teléfono
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Tipo Usuario
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-medium text-gray-700"
                >
                  Fecha Registro
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.user_id}
                  className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-base">
                    {u.rut}
                  </td>
                  <td className="px-6 py-4 text-base">{u.name}</td>
                  <td className="px-6 py-4 text-base">{u.lastname}</td>
                  <td className="px-6 py-4 text-base">{u.email}</td>
                  <td className="px-6 py-4 text-base">{u.telefono || "-"}</td>
                  <td className="px-6 py-4 text-base">
                    {u.tipo_usuario || "-"}
                  </td>

                  <td className="px-6 py-4 text-base">
                    {u.registration_date
                      ? new Date(u.registration_date).toLocaleString()
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

export default UsersData;
