import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="bg-[#eef2ff] px-10">
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 py-10">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1E3A8A]">
            El servicio que buscas, en un solo lugar.
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            La forma más fácil de contratar expertos de confianza para cualquier
            servicio que necesites
          </p>
          <button className="bg-[#FE7743] text-white px-8 py-3 rounded-full mt-6 text-lg font-semibold">
            Encuentra servicios
          </button>
        </div>
        <img
          src={assets.header}
          alt=""
          className="w-full md:w-2/3 max-w-xl rounded-lg shadow-lg ml-auto"
        />
      </div>
    </div>
  );
};

export default Header;
