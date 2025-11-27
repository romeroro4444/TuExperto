import React from "react";
import { assets } from "./../../assets/assets";

const FeaturedServices = () => {
  const servicios = [
    {
      titulo: "Servicios de Pintor",
      descripcion:
        "Expertos especializados en pintura interior y exterior, con acabados prolijos y asesoría en colores y materiales.",
    },
    {
      titulo: "Servicios de Mecánico",
      descripcion:
        "Mecánicos para diagnóstico, mantenciones y reparaciones de vehículos con atención rápida y confiable.",
    },
    {
      titulo: "Sevicios de Gásfiter",
      descripcion:
        "Expertos en gasfitería para reparaciones, instalaciones y detección de fugas, garantizando seguridad y funcionamiento óptimo.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center container mx-auto py-14 md:px-20 lg:px-32 w-full overflow-hidden">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-[#1E3A8A] text-center">
        Servicios{" "}
        <span className="underline underline-offset-4 decoration-2">
          Destacados
        </span>
      </h1>
      <p className="text-gray-600 max-w-2xl text-center mb-8">
        Encuentra profesionales cercanos y calificados para cualquier trabajo
        del hogar. Compara opciones, revisa reseñas reales y agenda con
        confianza. Todo en una sola plataforma diseñada para simplificar tu día
        a día.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center">
        {servicios.map((servicio, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center w-full sm:w-72 mb-4 sm:mb-0"
          >
            <img
              src={assets.profession_icon}
              alt=""
              className="mx-auto mb-3 w-8 h-8"
            />
            <h2 className="text-[#1E3A8A] font-extrabold text-xl text-center mb-2">
              {servicio.titulo}
            </h2>
            <p className="text-center text-gray-500 text-base">
              {servicio.descripcion}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedServices;
