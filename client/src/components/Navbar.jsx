import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Navbar = ({ setAuth, isAuthenticated }) => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");

  const getFullName = async () => {
    try {
      const response = await fetch("http://localhost:4000/fullname", {
        method: "GET",
        headers: { token: localStorage.token },
      });
      const parseRes = await response.json();
      setName(parseRes.name);
      setLastname(parseRes.lastname);
    } catch (error) {
      console.error(error.message);
    }
  };

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
    toast.success("Sesión cerrada");
  };

  useEffect(() => {
    if (isAuthenticated && localStorage.getItem("token")) {
      getFullName();
    } else {
      setName("");
      setLastname("");
    }
  }, [isAuthenticated]);
  const isLoggedIn = !!localStorage.getItem("token");

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
        {!isLoggedIn ? (
          <Link to="/login" className="hidden md:block">
            <button className="bg-[#FE7743] text-white px-8 py-2 rounded-full transition-colors duration-200 hover:bg-[#E56332] cursor-pointer">
              Iniciar Sesión
            </button>
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#1E3A8A]">
              {name} {lastname}
            </span>
            <button
              onClick={logout}
              className="bg-[#FE7743] text-white px-6 py-2 rounded-full transition-colors duration-200 hover:bg-[#E56332] cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
