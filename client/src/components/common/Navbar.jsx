import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { assets } from "./../../assets/assets";

const Navbar = ({ setAuth, isAuthenticated }) => {
  const [tipoUsuario, setTipoUsuario] = useState(null);
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
      // Obtener tipo de usuario
      const fetchTipoUsuario = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("http://localhost:4000/user-type", {
            method: "GET",
            headers: { token },
          });
          const data = await res.json();
          setTipoUsuario(data.tipo_usuario);
        } catch (err) {
          setTipoUsuario(null);
        }
      };
      fetchTipoUsuario();
    } else {
      setName("");
      setLastname("");
      setTipoUsuario(null);
    }
  }, [isAuthenticated]);
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="w-full z-10">
      <Toaster position="top-right" />
      <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-20 lg:px-32 bg-transparent">
        <h1 className="text-3xl font-bold text-[#1E3A8A]">TuExperto</h1>

        <ul className="hidden md:flex gap-7 text-black text-sm">
          <Link to="/" className="hover:text-gray-400">
            Inicio
          </Link>
          <Link to="/services" className="hover:text-gray-400">
            Servicios
          </Link>
          <Link to="/requests" className="hover:text-gray-400">
            Solicitudes
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
                {tipoUsuario === "PROFESIONAL" && (
                  <>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/mis-servicios");
                      }}
                    >
                      Mis Servicios
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/my-appointments");
                      }}
                    >
                      Mis Citas
                    </button>
                  </>
                )}
                {tipoUsuario === "CLIENTE" && (
                  <>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/mis-solicitudes");
                      }}
                    >
                      Mis Solicitudes
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/client-appointments");
                      }}
                    >
                      Mis Citas
                    </button>
                  </>
                )}
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
            {/* ADMIN link for desktop users */}
            {tipoUsuario === "ADMIN" && (
              <button
                className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/admin-panel");
                }}
              >
                ADMIN PANEL
              </button>
            )}
          </div>
        )}
      </div>
      {/* menu telefono */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg z-30">
          <ul className="flex flex-col gap-4 p-6 text-black text-base">
            <button
              className="text-left hover:text-gray-400"
              onClick={() => {
                setMenuOpen(false);
                navigate("/");
              }}
            >
              Inicio
            </button>
            <button
              className="text-left hover:text-gray-400"
              onClick={() => {
                setMenuOpen(false);
                navigate("/services");
              }}
            >
              Servicios
            </button>
            <button
              className="text-left hover:text-gray-400"
              onClick={() => {
                setMenuOpen(false);
                navigate("/requests");
              }}
            >
              Solicitudes
            </button>
            <button
              className="text-left hover:text-gray-400"
              onClick={() => {
                setMenuOpen(false);
                navigate("/");
              }}
            >
              Acerca de
            </button>
            {!isLoggedIn ? (
              <button
                className="bg-[#FE7743] text-white px-8 py-2 rounded-full w-full mt-2 transition-colors duration-200 hover:bg-[#E56332] cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/login");
                }}
              >
                Iniciar Sesión
              </button>
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
                {isLoggedIn && tipoUsuario === "PROFESIONAL" && (
                  <>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/mis-servicios");
                      }}
                    >
                      Mis Servicios
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/my-appointments");
                      }}
                    >
                      Mis Citas
                    </button>
                  </>
                )}
                {isLoggedIn && tipoUsuario === "CLIENTE" && (
                  <>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/mis-solicitudes");
                      }}
                    >
                      Mis Solicitudes
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/client-appointments");
                      }}
                    >
                      Mis Citas
                    </button>
                  </>
                )}
                {isLoggedIn && tipoUsuario === "ADMIN" && (
                  <>
                    <button
                      className="block w-full text-left px-4 py-2 text-[#1E3A8A] hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/admin-panel");
                      }}
                    >
                      ADMIN PANEL
                    </button>
                  </>
                )}
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
