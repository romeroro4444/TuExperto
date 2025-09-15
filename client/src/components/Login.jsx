import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Login = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const { email, password } = inputs;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        body: JSON.stringify(inputs),
        headers: { "Content-Type": "application/json" },
      });
      const parseRes = await response.json();
      //console.log(parseRes);

      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);
        setAuth(true);
        toast.success("Sesión Iniciada");
        window.location.href = "/profile";
      } else {
        setAuth(false);
        toast.error(
          typeof parseRes === "string" ? parseRes : "Error de autenticación"
        );
      }
    } catch (error) {
      console.error(error.message);
    }
  };
  return (
    <div className="bg-gray-100 min-h-[60vh] flex items-center justify-center py-30">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-3xl font-extrabold text-[#1E3A8A] text-center mb-2">
            Bienvenido de vuelta
          </h2>
          <p className="text-gray-500 text-center mb-4">
            Inicia sesión para continuar en TuExperto.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#273F4F]">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743]"
              name="email"
              value={email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#273F4F]">
              Contraseña
            </label>
            <input
              type="password"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743]"
              name="password"
              value={password}
              onChange={(e) =>
                setInputs({ ...inputs, password: e.target.value })
              }
            />
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="accent-[#FE7743]"
              />
              <label htmlFor="remember" className="text-gray-500">
                Recordarme
              </label>
            </div>
            <Link to="/" className="text-[#FE7743] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <button
            type="submit"
            className="bg-[#FE7743] text-white font-bold py-3 rounded-full mt-4 text-lg hover:bg-[#E56332] transition-colors cursor-pointer"
          >
            Iniciar Sesión
          </button>
          <p className="text-center text-sm mt-2 text-gray-500">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/register"
              className="text-[#FE7743] font-semibold hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
