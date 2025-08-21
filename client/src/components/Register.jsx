import React, { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Register = ({ setAuth }) => {
  const [profession, setProfession] = useState(false); // false = Cliente, true = Experto
  const [user, setUser] = useState({
    name: "",
    lastname: "",
    rut: "",
    telefono: "",
    email: "",
    password: "",
  });

  const [professions, setProfessions] = useState([]);
  const [professionalData, setProfessionalData] = useState({
    profession_id: "",
    description: "",
    specialization: "",
  });
  //cargar todas las profesiones
  const loadProfessions = async () => {
    const response = await fetch("http://localhost:4000/professions");
    const data = await response.json();
    setProfessions(data);
  };

  const navigate = useNavigate();

  const handleProfession = (isProfessional) => {
    setProfession(isProfessional);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // crea el usuario
      const response = await fetch("http://localhost:4000/user", {
        method: "POST",
        body: JSON.stringify(user),
        headers: { "Content-Type": "application/json" },
      });
      const parseRes = await response.json();
      if (parseRes.token && parseRes.user_id) {
        localStorage.setItem("token", parseRes.token);
        toast.success("Usuario Registrado");
        setAuth(true);

        // Solo crear profesional si el usuario fue creado correctamente
        if (profession) {
          const professionalPayload = {
            user_id: parseRes.user_id,
            ...professionalData,
          };
          const profResponse = await fetch(
            "http://localhost:4000/professional",
            {
              method: "POST",
              body: JSON.stringify(professionalPayload),
              headers: { "Content-Type": "application/json" },
            }
          );
          const profData = await profResponse.json();
          if (!profResponse.ok) {
            toast.error(profData.message || "Error al crear profesional");
            return;
          }
        }
      } else {
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      toast.error("Error de conexión con el servidor");
    }
  };

  const handleChange = (e) => {
    //copia los valores de user y los actualiza
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    loadProfessions();
  }, []);

  return (
    <div className="bg-gray-100 min-h-[60vh] flex items-center justify-center py-28">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743] w-1/2"
                />
                <input
                  placeholder="Apellido"
                  name="lastname"
                  value={user.lastname}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743] w-1/2"
                />
              </div>
              <div className="flex gap-4 w-full">
                <input
                  placeholder="RUT 12345678-9"
                  name="rut"
                  value={user.rut}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743] w-1/2"
                />
                <input
                  placeholder="Teléfono"
                  name="telefono"
                  value={user.telefono}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743] w-1/2"
                />
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="password"
                  placeholder="Contraseña"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743]"
                />
              </div>
              {profession && (
                <>
                  <div>
                    <label className="text-base text-gray-700 text-left font-semibold">
                      Oficio
                    </label>
                    <select
                      className="bg-white border border-[#1E3A8A] text-[#1E3A8A] text-sm rounded-lg focus:ring-[#FE7743] focus:border-[#FE7743] block w-full p-2.5 placeholder-gray-400"
                      name="profession_id"
                      value={professionalData.profession_id}
                      onChange={(e) =>
                        setProfessionalData({
                          ...professionalData,
                          profession_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Elige un Oficio</option>
                      {professions.map((prof) => (
                        <option
                          key={prof.profession_id}
                          value={prof.profession_id}
                          className="text-[#1E3A8A]"
                        >
                          {prof.profession_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Descripción"
                      name="description"
                      value={professionalData.description}
                      onChange={(e) =>
                        setProfessionalData({
                          ...professionalData,
                          description: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743]"
                    />
                    <input
                      type="text"
                      placeholder="Especialización"
                      name="specialization"
                      value={professionalData.specialization}
                      onChange={(e) =>
                        setProfessionalData({
                          ...professionalData,
                          specialization: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FE7743]"
                    />
                  </div>
                </>
              )}
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
