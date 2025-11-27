import { useNavigate } from "react-router-dom";

const JoinAsProfessional = () => {
  const navigate = useNavigate();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="bg-[#1E3A8A] px-10">
      <div className="flex flex-col items-center justify-center container mx-auto p-14 md:px-20 lg:px-32 w-full overflow-hidden">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white text-center">
          ¿Listo para impulsar tu carrera profesional?
        </h1>
        <p className="text-white max-w-2xl text-center mb-10 mx-auto text-lg leading-relaxed">
          Únete a miles de expertos que ya están conectando con nuevos clientes
          y haciendo crecer su negocio
        </p>
        {!token && (
          <button
            onClick={goToRegister}
            className="bg-[#FE7743] text-white px-8 py-3 rounded-full mt-6 text-lg font-semibold"
          >
            Únete como Profesional
          </button>
        )}
      </div>
    </div>
  );
};

export default JoinAsProfessional;
