import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { assets } from "../assets/assets";

const Navbar = ({ setAuth, isAuthenticated }) => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    setMenuOpen(false);
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
      <Toaster position="top-right" />
      <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-20 lg:px-32 bg-transparent">
        <h1 className="text-3xl font-bold text-[#1E3A8A]">TuExperto</h1>
        {/* Desktop menu */}
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
        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center justify-center focus:outline-none"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg
            className="w-8 h-8 text-[#1E3A8A]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {/* Auth buttons */}
        {!isLoggedIn ? (
          <Link to="/login" className="hidden md:block">
            <button className="bg-[#FE7743] text-white px-8 py-2 rounded-full transition-colors duration-200 hover:bg-[#E56332] cursor-pointer">
              Iniciar Sesión
            </button>
          </Link>
        ) : (
          <div className="hidden md:flex items-center gap-4 relative">
            <button
              className="flex items-center font-semibold text-[#1E3A8A] focus:outline-none"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {name} {lastname}
              <img
                src={assets.arrow}
                alt="Flecha"
                className={`ml-2 w-8 h-8 transition-transform duration-200 cursor-pointer ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-white shadow-lg rounded-md py-2 w-40 z-20">
                <button
                  className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  Mi Perfil
                </button>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg z-30">
          <ul className="flex flex-col gap-4 p-6 text-black text-base">
            <Link
              to="/"
              className="hover:text-gray-400"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/"
              className="hover:text-gray-400"
              onClick={() => setMenuOpen(false)}
            >
              Servicios
            </Link>
            <Link
              to="/"
              className="hover:text-gray-400"
              onClick={() => setMenuOpen(false)}
            >
              Acerca de
            </Link>
            {!isLoggedIn ? (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <button className="bg-[#FE7743] text-white px-8 py-2 rounded-full w-full mt-2 transition-colors duration-200 hover:bg-[#E56332] cursor-pointer">
                  Iniciar Sesión
                </button>
              </Link>
            ) : (
              <>
                <button
                  className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  Mi Perfil
                </button>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
