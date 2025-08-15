import React from "react";
import { assets } from "../assets/assets";

const FeaturedServices = () => {
  const servicios = [
    {
      titulo: "Oficio 1",
      descripcion: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
    },
    {
      titulo: "Oficio 2",
      descripcion: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
    },
    {
      titulo: "Oficio 3",
      descripcion: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
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
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fuga, eaque
        fugiat quia, possimus neque dolor error dolorum doloribus quasi
        inventore asperiores at officiis repellat qui atque nam consectetur eum
        odio.
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
