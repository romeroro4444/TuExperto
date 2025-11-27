import React, { useEffect, useState } from "react";
import RequestCard from "./../common/RequestCard";
import { assets } from "../../assets/assets";

const Servicios = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;
  const [search, setSearch] = useState("");
  const [profession, setProfession] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const PRICE_MIN = 0;
  const PRICE_MAX = 1000000;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:4000/requests");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const indexOfLastRequests = currentPage * requestsPerPage;
  const indexOfFirstRequests = indexOfLastRequests - requestsPerPage;
  // Filtrar servicios en frontend
  const filteredrequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(search.toLowerCase()) ||
      request.description.toLowerCase().includes(search.toLowerCase());
    // hide pending or rejected requests from public listing
    const status = request.status || request.estado || "";
    const isVisible = !/pend|rech/i.test(status);
    const matchesProfession = profession
      ? request.profession_name === profession
      : true;
    const matchesSpecialization = specialization
      ? request.specialization_name
        ? request.specialization_name === specialization
        : false
      : true;
    const matchesPrice =
      request.budget >= minPrice && request.budget <= maxPrice;
    return (
      matchesSearch &&
      matchesProfession &&
      matchesSpecialization &&
      matchesPrice &&
      isVisible
    );
  });
  const currentrequests = filteredrequests.slice(
    indexOfFirstRequests,
    indexOfLastRequests
  );
  const totalPages = Math.ceil(filteredrequests.length / requestsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-2 md:px-20 lg:px-32">
      <h2 className="text-3xl font-bold text-[#1E3A8A] mb-8">
        Buscar Solicitudes de Servicio
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
              placeholder="Buscar solicitud"
              maxLength={100}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value.slice(0, 100));
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#FE7743]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-[#1E3A8A]">
              Profesión
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={profession}
              onChange={(e) => {
                setProfession(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Selecciona Profesión</option>
              {[
                ...new Set(
                  requests.map((s) => s.profession_name).filter(Boolean)
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
              Rango de Precio
            </label>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Min: ${minPrice.toLocaleString()}</span>
              <span>Max: ${maxPrice.toLocaleString()}</span>
            </div>

            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              value={minPrice}
              onChange={(e) => {
                const value = Number(e.target.value);
                // Prevent min exceeding current max
                const newMin = Math.min(value, maxPrice);
                setMinPrice(newMin);
                setCurrentPage(1);
              }}
              className="w-full"
            />

            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              value={maxPrice}
              onChange={(e) => {
                const value = Number(e.target.value);
                const newMax = Math.max(value, minPrice);
                setMaxPrice(newMax);
                setCurrentPage(1);
              }}
              className="w-full mt-2"
            />
          </div>
        </aside>

        <section className="md:w-3/4">
          {loading ? (
            <div className="text-center text-[#1E3A8A]">
              Cargando solicitudes...
            </div>
          ) : (
            <div className="grid gap-6">
              {currentrequests.length === 0 ? (
                <div className="text-center text-gray-500">
                  No hay servicios disponibles.
                </div>
              ) : (
                currentrequests.map((request) => (
                  <RequestCard key={request.request_id} request={request} />
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
