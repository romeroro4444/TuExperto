import * as React from "react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";

const Appointment = () => {
  const [value, setValue] = React.useState(dayjs());
  const { service_id } = useParams();
  const [selectedTime, setSelectedTime] = useState("12:00 AM");
  const navigate = useNavigate();

  // Estado para los datos del servicio
  const [serviceDetails, setServiceDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Obtener user_id del token
  const token = localStorage.getItem("token");
  let user_id = "";
  if (token) {
    const decoded = jwtDecode(token);
    user_id = decoded.user;
  }

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reservation_date = `${value.format("YYYY-MM-DD")} ${selectedTime}`;
    const appointment = {
      user_id,
      service_id,
      reservation_date,
    };
    try {
      const res = await fetch("http://localhost:4000/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify(appointment),
      });
      toast.success("Cita agendada correctamente");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const res = await fetch(`http://localhost:4000/service/${service_id}`);
        const data = await res.json();
        setServiceDetails(data);
      } catch (err) {
        setServiceDetails(null);
      }
    };
    if (service_id) fetchServiceDetails();
  }, [service_id]);

  // fetch reviews for this service using the new endpoint
  useEffect(() => {
    if (!service_id) return;
    const fetchServiceReviews = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/service/${service_id}/reviews`
        );
        if (!res.ok) {
          setReviews([]);
          return;
        }
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setReviews([]);
      }
    };
    fetchServiceReviews();
  }, [service_id]);

  return (
    <div className="w-full px-4 md:px-8 lg:px-24 xl:px-48 py-4">
      <Toaster position="top-right" />
      <div className="flex flex-col items-center text-center mb-6">
        {serviceDetails ? (
          <div className="mb-4 w-full">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#1E3A8A] leading-tight mb-2 drop-shadow-lg">
              Agendando tu Cita con{" "}
              {serviceDetails.profesional_name || "[Profesional]"}
            </h1>
            <div className="text-left w-full max-w-2xl mx-auto bg-white rounded-xl shadow p-4 mt-2">
              <p>
                <strong>Servicio:</strong> {serviceDetails.service_name}
              </p>
              <div>
                <strong>Descripción:</strong>
                <div className="mt-1 text-gray-700 break-words max-w-full whitespace-pre-line">
                  {serviceDetails.description &&
                  serviceDetails.description.length > 300 ? (
                    <>
                      {showFullDescription
                        ? serviceDetails.description
                        : `${serviceDetails.description.slice(0, 300)}...`}
                      <button
                        type="button"
                        onClick={() => setShowFullDescription((s) => !s)}
                        className="ml-2 text-sm text-[#FE7743] font-medium hover:underline"
                      >
                        {showFullDescription ? "Mostrar menos" : "Mostrar más"}
                      </button>
                    </>
                  ) : (
                    serviceDetails.description || ""
                  )}
                </div>
              </div>
              <p>
                <strong>Precio:</strong> ${serviceDetails.price}
              </p>
              <p>
                <strong>Modalidad:</strong> {serviceDetails.modality}
              </p>
              <p>
                <strong>Duración:</strong> {serviceDetails.duration}
              </p>
              {serviceDetails.profession_name && (
                <p>
                  <strong>Profesión:</strong> {serviceDetails.profession_name}
                </p>
              )}
            </div>
          </div>
        ) : (
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#1E3A8A] leading-tight mb-2 drop-shadow-lg">
            Agendando tu Cita
          </h1>
        )}
        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-[#FE7743] leading-snug mb-2">
          Selecciona el día y hora que quieres agendar
        </h2>
      </div>
      <div className="pt-5 border-t border-gray-200 flex flex-col md:flex-row md:space-x-8 gap-8 items-center justify-center w-full">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex justify-center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DateCalendar"]}>
              <DemoItem>
                <DateCalendar
                  value={value}
                  onChange={(newValue) => setValue(newValue)}
                  sx={{
                    width: 400,
                    minWidth: 320,
                    maxWidth: 500,
                    margin: "0 auto",
                    "& .MuiPickersCalendarHeader-root": { fontSize: "2rem" },
                    "& .MuiDayCalendar-weekDayLabel": { fontSize: "1.3rem" },
                    "& .MuiDayCalendar-day": {
                      fontSize: "1.5rem",
                      height: 56,
                      width: 56,
                    },
                  }}
                />
              </DemoItem>
            </DemoContainer>
          </LocalizationProvider>
        </div>
        <div className="w-full sm:max-w-sm md:max-w-xs lg:max-w-md mt-5 md:mt-0 flex flex-col items-center justify-center">
          <h3 className="text-[#1E3A8A] text-xl sm:text-2xl font-bold mb-5 text-center">
            Selecciona una hora
          </h3>
          <label className="sr-only">Pick a time</label>
          <ul id="timetable" className="grid w-full grid-cols-2 gap-4 mt-5">
            <li>
              <input
                type="radio"
                id="10-am"
                value="10:00 AM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "10:00 AM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="10-am"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                10:00 AM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="10-30-am"
                value="10:30 AM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "10:30 AM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="10-30-am"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                10:30 AM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="11-am"
                value="11:00 AM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "11:00 AM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="11-am"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                11:00 AM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="11-30-am"
                value="11:30 AM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "11:30 AM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="11-30-am"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                11:30 AM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="12-pm"
                value="12:00 PM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "12:00 PM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="12-pm"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                12:00 PM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="12-30-pm"
                value="12:30 PM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "12:30 PM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="12-30-pm"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                12:30 PM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="1-pm"
                value="01:00 PM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "01:00 PM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="1-pm"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                01:00 PM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="1-30-pm"
                value="01:30 PM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "01:30 PM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="1-30-pm"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                01:30 PM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="2-pm"
                value="02:00 PM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "02:00 PM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="2-pm"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                02:00 PM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="2-30-pm"
                value="02:30 PM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "02:30 PM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="2-30-pm"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                02:30 PM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="3-pm"
                value="03:00 PM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "03:00 PM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="3-pm"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                03:00 PM
              </label>
            </li>
            <li>
              <input
                type="radio"
                id="3-30-pm"
                value="03:30 PM"
                className="hidden peer"
                name="timetable"
                checked={selectedTime === "03:30 PM"}
                onChange={handleTimeChange}
              />
              <label
                htmlFor="3-30-pm"
                className="inline-flex items-center justify-center w-full p-4 text-lg sm:text-2xl font-semibold text-center bg-white border-2 rounded-xl cursor-pointer text-[#FE7743] border-[#FE7743] peer-checked:bg-[#FE7743] peer-checked:text-white hover:bg-[#FE7743] hover:text-white transition-colors"
              >
                03:30 PM
              </label>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex justify-center w-full mt-10 mb-4">
        <button
          className="bg-[#FE7743] text-white rounded-full px-6 py-3 font-semibold text-lg hover:bg-[#E56332] transition-colors w-full sm:w-auto cursor-pointer shadow-lg"
          onClick={handleSubmit}
        >
          Agendar Cita
        </button>
      </div>
      {/* reseñas del servicio */}
      <div className="mt-6 w-full max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-3">Reseñas de este servicio</h3>
        {reviews.length === 0 ? (
          <div className="p-4 bg-white rounded-xl shadow">
            No hay reseñas todavía.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.review_id} className="bg-gray-50 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-yellow-400 text-lg">
                    {Array(r.rating).fill("★").join("")}
                  </div>
                  <div className="text-sm text-gray-500">
                    {r.review_date
                      ? new Date(r.review_date).toLocaleDateString()
                      : ""}
                  </div>
                </div>
                <div className="text-gray-700">
                  {r.comment || "Sin comentario"}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Cliente:{" "}
                  {r.client_name
                    ? `${r.client_name || ""} ${r.client_lastname || ""}`
                    : r.client_rut || r.client_id || "Anon"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;
