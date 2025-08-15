import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [profession, setProfession] = useState(false); // false = Cliente, true = Profesional

  const handleProfession = (isProfessional) => {
    setProfession(isProfessional);
  };
  return (
    <div className="bg-gray-100 min-h-[60vh] flex items-center justify-center py-28">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <form className="flex flex-col gap-4">
          <h2 className="text-3xl font-extrabold text-[#1E3A8A] text-center">
            Crea tu cuenta
          </h2>
          <div className="text-center text-sm">
            <span className="text-gray-500">¿Ya tienes una cuenta? </span>
            <Link
              to="/login"
              className="text-[#FE7743] hover:underline font-semibold ml-1"
            >
              inicia sesión
            </Link>
          </div>
          <div>
            <div className="flex flex-col gap-4 mt-4 w-full">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-base text-gray-700 text-left font-semibold">
                  Soy un
                </label>
                <div className="flex w-full">
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-l-lg font-semibold focus:outline-none border border-[#FE7743] cursor-pointer ${
                      !profession
                        ? "bg-[#FE7743] text-white"
                        : "bg-white text-[#1E3A8A]"
                    }`}
                    onClick={() => handleProfession(false)}
                  >
                    Cliente
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-r-lg font-semibold focus:outline-none border border-[#FE7743] border-l-0 cursor-pointer ${
                      profession
                        ? "bg-[#FE7743] text-white"
                        : "bg-white text-[#1E3A8A]"
                    }`}
                    onClick={() => handleProfession(true)}
                  >
                    Experto
                  </button>
                </div>
              </div>
              <div className="flex gap-4 w-full">
                <input
                  placeholder="Nombre"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743] w-1/2"
                />
                <input
                  placeholder="Apellido"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743] w-1/2"
                />
              </div>
              <div className="flex gap-4 w-full">
                <input
                  placeholder="RUT 12345678-9"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743] w-1/2"
                />
                <input
                  placeholder="Teléfono"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743] w-1/2"
                />
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2 accent-[#FE7743]" />
                <span className="text-gray-700">
                  Acepto los{" "}
                  <span className="text-[#FE7743] font-semibold">
                    Términos de Servicio
                  </span>{" "}
                  y la{" "}
                  <span className="text-[#FE7743] font-semibold">
                    Política de Privacidad
                  </span>
                  .
                </span>
              </label>
              <button
                type="submit"
                className="w-full bg-[#FE7743] text-white font-semibold rounded-full py-3 text-base hover:bg-[#E56332] transition-colors cursor-pointer"
              >
                Registrarse
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
