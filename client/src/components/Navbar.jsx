import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="w-full z-10">
      <div className="container mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32 bg-transparent">
        <h1 className="text-3xl font-bold text-[#1E3A8A]">TuExperto</h1>
        <ul className="hidden md:flex gap-7 text-black text-sm">
          <Link to="/" className="hover:text-gray-400">
            Inicio
          </Link>
          <Link to="/" className="hover:text-gray-400">
            Servicios
          </Link>
          <Link to="/" className="hover:text-gray-400">
            Acerca de
          </Link>
        </ul>
        <Link to="/login" className="hidden md:block">
          <button className="bg-[#FE7743] text-white px-8 py-2 rounded-full transition-colors duration-200 hover:bg-[#E56332] cursor-pointer">
            Iniciar Sesión
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
