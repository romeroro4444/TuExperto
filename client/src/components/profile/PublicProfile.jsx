import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PublicProfile = () => {
  const { professional_id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/professional/${professional_id}`
        );
        if (!res.ok) throw new Error("Perfil no encontrado");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message || "Error al obtener perfil");
      } finally {
        setLoading(false);
      }
    };
    if (professional_id) fetchProfile();
  }, [professional_id]);

  if (loading)
    return <div className="text-center mt-8">Cargando perfil...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-600">{error}</div>;
  if (!data)
    return <div className="text-center mt-8">Perfil no encontrado</div>;

  const { user, professional, specializations } = data;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold">
          {user && user.name ? user.name[0] : "P"}
        </div>
        <div>
          <h2 className="text-2xl font-bold">
            {user.name} {user.lastname}
          </h2>
          <div className="text-sm text-gray-600">
            {professional.profession_name}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Acerca de</h3>
        <p className="text-gray-700 mt-2">{professional.description}</p>
      </div>

      {specializations && specializations.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">Especializaciones</h4>
          <div className="flex gap-2 mt-2 flex-wrap">
            {specializations.map((s) => (
              <span
                key={s.specialization_id}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                {s.specialization_name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded bg-gray-200"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default PublicProfile;
