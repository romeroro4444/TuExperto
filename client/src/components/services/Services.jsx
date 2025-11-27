import React, { useEffect, useState } from "react";
import ServiceCard from "../common/ServiceCard";
import { assets } from "../../assets/assets";

const Servicios = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;
  const [search, setSearch] = useState("");
  const [profession, setProfession] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);

  const REGIONS = ["Región Metropolitana"];
  const COMUNAS = [
    "Cerrillos",
    "Cerro Navia",
    "Conchalí",
    "El Bosque",
    "Estación Central",
    "Huechuraba",
    "Independencia",
    "La Cisterna",
    "La Florida",
    "La Granja",
    "La Pintana",
    "La Reina",
    "Las Condes",
    "Lo Barnechea",
    "Lo Espejo",
    "Lo Prado",
    "Macul",
    "Maipú",
    "Ñuñoa",
    "Padre Hurtado",
    "Pedro Aguirre Cerda",
    "Peñalolén",
    "Pirque",
    "Providencia",
    "Pudahuel",
    "Puente Alto",
    "Quilicura",
    "Quinta Normal",
    "Recoleta",
    "Renca",
    "San Bernardo",
    "San Joaquín",
    "San José de Maipo",
    "San Miguel",
    "San Ramón",
    "Santiago",
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:4000/services");
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  // Filtrar servicios en frontend
  const filteredServices = services.filter((service) => {
    if (!service.active) return false; // Solo servicios activos
    const matchesSearch =
      service.title.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase());
    const matchesProfession = profession
      ? service.profession_name === profession
      : true;
    const matchesSpecialization = specialization
      ? service.specialization_name
        ? service.specialization_name === specialization
        : false
      : true;
    const matchesRegion = region ? service.region === region : true;
    const matchesComuna = comuna ? service.comuna === comuna : true;
    const matchesPrice = service.price >= minPrice && service.price <= maxPrice;
    return (
      matchesSearch &&
      matchesProfession &&
      matchesSpecialization &&
      matchesRegion &&
      matchesComuna &&
      matchesPrice
    );
  });
  const currentServices = filteredServices.slice(
    indexOfFirstService,
    indexOfLastService
  );
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-2 md:px-20 lg:px-32">
      <h2 className="text-3xl font-bold text-[#1E3A8A] mb-8">
        Buscar Servicios
      </h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros */}
        <aside className="md:w-1/4 bg-white rounded-xl shadow p-6 mb-8 md:mb-0">
          <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">Filtros</h3>
          <div className="relative mb-4">
            <img
              src={assets.lookingfor}
              alt="buscar"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-70 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar servicios"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#FE7743]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-[#1E3A8A]">
              Expertise
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={profession}
              onChange={(e) => {
                setProfession(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Tipos de Expertos</option>
              {[
                ...new Set(
                  services.map((s) => s.profession_name).filter(Boolean)
                ),
              ].map((prof, idx) => (
                <option key={idx} value={prof}>
                  {prof}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-[#1E3A8A]">
              Región
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setComuna("");
                setCurrentPage(1);
              }}
            >
              <option value="">Selecciona Región</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-[#1E3A8A]">
              Comuna
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={comuna}
              onChange={(e) => {
                setComuna(e.target.value);
                setCurrentPage(1);
              }}
              disabled={!region}
            >
              <option value="">Selecciona Comuna</option>
              {COMUNAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-[#1E3A8A]">
              Rango de Precio
            </label>
            <div className="flex justify-between items-center mb-2 text-sm text-gray-700">
              <div>
                Min:{" "}
                <span className="font-semibold">
                  ${minPrice.toLocaleString()}
                </span>
              </div>
              <div>
                Max:{" "}
                <span className="font-semibold">
                  ${maxPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="100000"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full mt-2"
            />
          </div>
          {/*           <div>
            <label className="block text-sm font-semibold mb-1 text-[#1E3A8A]">
              Calificación mínima
            </label>
            <input type="range" min="1" max="5" className="w-full" />
          </div> */}
        </aside>

        <section className="md:w-3/4">
          {loading ? (
            <div className="text-center text-[#1E3A8A]">
              Cargando servicios...
            </div>
          ) : (
            <div className="grid gap-6">
              {currentServices.length === 0 ? (
                <div className="text-center text-gray-500">
                  No hay servicios disponibles.
                </div>
              ) : (
                currentServices.map((service) => (
                  <ServiceCard key={service.service_id} service={service} />
                ))
              )}
            </div>
          )}
          {/* Paginación*/}
          <div className="flex justify-center mt-8">
            <nav className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 text-[#1E3A8A] cursor-pointer"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    currentPage === i + 1
                      ? "bg-[#FE7743] text-white font-bold"
                      : "bg-gray-200 text-[#1E3A8A]"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded bg-gray-200 text-[#1E3A8A] cursor-pointer"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </nav>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Servicios;
