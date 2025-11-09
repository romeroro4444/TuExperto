import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = ({ tipo_usuario }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [professionalReviews, setProfessionalReviews] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      let url = "";
      if (tipo_usuario === "PROFESIONAL") {
        url = "http://localhost:4000/profile";
      } else {
        url = "http://localhost:4000/profile-client";
      }
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: { token },
        });
        const data = await res.json();
        if (tipo_usuario === "PROFESIONAL" && data.user && data.professional) {
          setProfileData({
            name: data.user.name || "",
            lastname: data.user.lastname || "",
            profession: data.professional.profession_name || "",
            about: data.professional.description || "",
            specializations: data.specializations || [],
            services: "En Construcción",
            reviews: "En Construcción",
            // agregar identificadores para filtrar reseñas
            rut: data.user.rut || null,
            professional_id: data.professional.professional_id || null,
          });
        } else if (tipo_usuario !== "PROFESIONAL" && data.user) {
          setProfileData({
            name: data.user.name || "",
            lastname: data.user.lastname || "",
            telefono: data.user.telefono || "",
            email: data.user.email || "",
          });
        } else {
          setProfileData(null);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [tipo_usuario]);

  useEffect(() => {
    const fetchProfessionalReviews = async () => {
      if (tipo_usuario !== "PROFESIONAL") return;
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:4000/reviews", {
          method: "GET",
          headers: { token },
        });
        const data = await res.json();
        // Filtrar reseñas por el profesional actual usando su RUT (o professional_id si disponible)
        if (profileData && (profileData.rut || profileData.professional_id)) {
          const filtered = data.filter((rev) => {
            if (profileData.rut && rev.professional_rut) {
              return String(rev.professional_rut) === String(profileData.rut);
            }
            // si backend devolviera professional_id en el futuro, usarlo
            if (profileData.professional_id && rev.professional_id) {
              return (
                String(rev.professional_id) ===
                String(profileData.professional_id)
              );
            }
            return false;
          });
          setProfessionalReviews(filtered);
        } else {
          setProfessionalReviews([]);
        }
      } catch (err) {
        setProfessionalReviews([]);
      }
    };
    fetchProfessionalReviews();
  }, [tipo_usuario, profileData]);

  if (loading)
    return <div className="text-center mt-8">Cargando perfil...</div>;
  if (tipo_usuario !== "PROFESIONAL") {
    if (!profileData)
      return <div className="text-center mt-8">No se encontró el perfil.</div>;
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Tu información</h2>
        <p className="mb-2">
          <strong>Nombre:</strong> {profileData.name}
        </p>
        <p className="mb-2">
          <strong>Apellido:</strong> {profileData.lastname}
        </p>
        <p className="mb-2">
          <strong>Email:</strong> {profileData.email}
        </p>
        <p className="mb-6">
          <strong>Teléfono:</strong> {profileData.telefono}
        </p>
        <button
          className="bg-[#1E3A8A] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#16306b] transition-colors"
          onClick={() => navigate("/edit-profile")}
        >
          Editar Información
        </button>
      </div>
    );
  }
  if (tipo_usuario === "PROFESIONAL" && !profileData)
    return <div className="text-center mt-8">No se encontró el perfil.</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500">
            {/* Imagen de perfil*/}
            <span>{profileData.name ? profileData.name[0] : "P"}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {profileData.name} {profileData.lastname}
              <button
                title="Editar perfil"
                className="ml-2 text-gray-500 hover:text-[#1E3A8A]"
                onClick={() => navigate("/edit-profile")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.06 9.02l.92.92-7.06 7.06H7v-.92l7.06-7.06zm3.02-3.02c-.39-.39-1.02-.39-1.41 0l-1.13 1.13 2.33 2.33 1.13-1.13c.39-.39.39-1.02 0-1.41l-1.92-1.92zM3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25z" />
                </svg>
              </button>
            </h2>
            <p className="text-gray-600">{profileData.profession}</p>
          </div>
        </div>
        <button className="bg-[#1E3A8A] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#16306b] transition-colors">
          Contactar
        </button>
      </div>

      <div className="border-b mb-6">
        <nav className="flex gap-8 text-gray-500 text-sm">
          <span className="font-semibold text-[#1E3A8A] cursor-pointer">
            Acerca de
          </span>
          <span className="cursor-pointer">Reseñas</span>
          <span className="cursor-pointer">Disponibilidad</span>
        </nav>
      </div>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Acerca de</h3>
        <p className="text-gray-700 leading-relaxed">{profileData.about}</p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Especialización</h3>
        <div className="flex flex-wrap gap-2">
          {profileData.specializations.map((spec) => (
            <span
              key={spec.specialization_id || spec}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
            >
              {spec.specialization_name || spec}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Servicios</h3>
        <p className="text-gray-700 leading-relaxed">{profileData.services}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Reseñas</h3>
        {professionalReviews.length === 0 ? (
          <p className="text-gray-700 leading-relaxed">
            Aún no tienes reseñas.
          </p>
        ) : (
          <div className="space-y-4">
            {professionalReviews.map((review) => (
              <div
                key={review.review_id}
                className="bg-gray-50 p-4 rounded shadow"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-400 text-xl">
                    {"★".repeat(review.rating)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {review.rating}/5
                  </span>
                </div>
                <div className="text-gray-700 mb-1">{review.comment}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
