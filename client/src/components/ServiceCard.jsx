import React from "react";
import { Link } from "react-router-dom";

const ServiceCard = ({ service }) => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  return (
    <div className="bg-white rounded-xl shadow flex flex-col md:flex-row items-center p-6 gap-6">
      <div className="flex-1">
        <h4 className="text-xl font-bold text-[#1E3A8A] mb-2">
          {service.title}
        </h4>
        <p className="text-gray-700 mb-2 break-words break-all whitespace-pre-line w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl">
          {service.description}
        </p>
        <div className="flex flex-wrap gap-4 mb-2">
          <span className="bg-[#FE7743] text-white px-3 py-1 rounded-full text-xs font-semibold">
            ${service.price}
          </span>
          <span className="bg-gray-200 text-[#1E3A8A] px-3 py-1 rounded-full text-xs font-semibold">
            {service.modality}
          </span>
          <span className="bg-gray-200 text-[#1E3A8A] px-3 py-1 rounded-full text-xs font-semibold">
            {service.duration}
          </span>
        </div>
        {isLoggedIn ? (
          <Link
            to={`/service/${service.service_id}`}
            className="inline-block bg-[#1E3A8A] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#16306b] transition-colors mt-2"
          >
            Agendar Cita
          </Link>
        ) : (
          <button
            className="inline-block bg-gray-400 text-white px-6 py-2 rounded-full font-semibold mt-2 cursor-not-allowed opacity-70"
            disabled
            title="Debes iniciar sesión para agendar"
          >
            Inicia sesión para agendar
          </button>
        )}
      </div>
      <div className="flex flex-col items-center w-32">
        <div className="h-32 w-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src={service.image_url || "https://placehold.co/100x100"}
            alt={service.title}
            className="object-cover w-full h-full"
          />
        </div>
        {service.profession_name && (
          <div className="w-full text-center mt-2">
            <span className="text-xs text-[#1E3A8A] font-semibold bg-gray-100 rounded px-2 py-1">
              {service.profession_name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
