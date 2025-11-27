import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

const RequestCard = ({ request }) => {
  return (
    <div className="bg-white rounded-xl shadow flex flex-col md:flex-row items-center p-6 gap-6">
      <div className="flex-1 min-w-0">
        <h4 className="text-xl font-bold text-[#1E3A8A] mb-2">
          {request.titulo || request.title}
        </h4>
        <p className="text-gray-700 mb-2 break-words break-all whitespace-pre-line w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl">
          {request.descripcion || request.description}
        </p>
        <div className="flex flex-wrap gap-4 mb-2">
          <span className="bg-[#FE7743] text-white px-3 py-1 rounded-full text-xs font-semibold">
            ${request.presupuesto || request.budget}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center w-32">
        <div className="h-32 w-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src={request.imagen_url || request.image_url || assets.lookingfor}
            alt={request.titulo || request.title}
            className={
              request.imagen_url || request.image_url
                ? "object-cover w-full h-full"
                : "object-contain w-full h-full p-4"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
