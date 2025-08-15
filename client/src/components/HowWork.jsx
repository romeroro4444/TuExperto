import React from "react";

const HowWork = () => {
  return (
    <div className="bg-[#eef2ff] px-10">
      <div className="flex flex-col items-center justify-center container mx-auto p-14 md:px-20 lg:px-32 w-full overflow-hidden">
        <h1 className="text-2x1 sm:text-4xl font-bold mb-4 text-[#1E3A8A]">
          ¿Cómo funciona?
        </h1>
        <p className="text-gray-600 max-w-full text-center mb-8">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique,
          molestiae delectus placeat earum perspiciatis harum? Accusamus eos nam
          non, distinctio nemo dolore cumque qui, est laboriosam, minus cum
          corrupti perferendis.
        </p>
        <div className="flex flex-col md:flex-row items-start justify-center gap-10 w-full">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FE7743] text-white text-xl font-bold">
              1
            </div>
            <h4 className="text-center mt-2 font-bold text-[#1E3A8A] text-2xl mb-2">
              Crea tu Perfil
            </h4>
            <p className="text-gray-600">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FE7743] text-white text-xl font-bold">
              2
            </div>
            <h4 className="text-center mt-2 font-bold text-[#1E3A8A] text-2xl mb-2">
              Busca un Servicio
            </h4>
            <p className="text-gray-600">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FE7743] text-white text-xl font-bold">
              3
            </div>
            <h4 className="text-center mt-2 font-bold text-[#1E3A8A] text-2xl mb-2">
              Agenda, Paga y Listo
            </h4>
            <p className="text-gray-600">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowWork;
