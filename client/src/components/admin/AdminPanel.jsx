import React, { useState } from "react";
import { assets } from "./../../assets/assets";
import Dashboard from "./Dashboard";
import UsersData from "./UsersData";
import ProfessionalsData from "./ProfessionalsData";
import ServicesData from "./ServicesData";
import RequestsData from "./RequestsData";
import ComplaintsData from "./ComplaintsData";
import AppointmentsData from "./AppointmentsData";
import NoitificationsData from "./NotificationsData";
import ReviewsData from "./ReviewsData";

const AdminPanel = () => {
  const [active, setActive] = useState("dashboard"); // default active tab

  const tabClass = (key) =>
    `flex items-center text-lg py-5 px-6 cursor-pointer transition-all ${
      active === key
        ? "text-blue-700 bg-white font-semibold"
        : "text-slate-900 font-medium hover:text-blue-700"
    }`;

  return (
    <div className="flex items-start gap-6 w-full">
      <ul className="space-y-2 min-w-[250px] bg-gray-100 inline-block py-3">
        <li
          id="dashboard"
          onClick={() => setActive("dashboard")}
          className={tabClass("dashboard")}
        >
          <img
            src={assets.dashboardIcon}
            alt="Dashboard"
            className="w-6 h-6 mr-3 inline-block"
          />
          Dashboard
        </li>

        <li
          id="usersTab"
          onClick={() => setActive("users")}
          className={tabClass("users")}
        >
          <img
            src={assets.userIcon}
            alt="Users"
            className="w-6 h-6 mr-3 inline-block"
          />
          Users
        </li>

        <li
          id="professionalsTab"
          onClick={() => setActive("professionals")}
          className={tabClass("professionals")}
        >
          <img
            src={assets.professionalsIcon}
            alt="Professionals"
            className="w-6 h-6 mr-3 inline-block"
          />
          Professionals
        </li>
        <li
          id="servicesTab"
          onClick={() => setActive("services")}
          className={tabClass("services")}
        >
          <img
            src={assets.professionsIcon}
            alt="Services"
            className="w-6 h-6 mr-3 inline-block"
          />
          Services
        </li>
        <li
          id="requestsTab"
          onClick={() => setActive("requests")}
          className={tabClass("requests")}
        >
          <img
            src={assets.servicesIcon}
            alt="requests"
            className="w-6 h-6 mr-3 inline-block"
          />
          Requests
        </li>
        <li
          id="appointmentsTab"
          onClick={() => setActive("appointments")}
          className={tabClass("appointments")}
        >
          <img
            src={assets.appointmentIcon}
            alt="requests"
            className="w-6 h-6 mr-3 inline-block"
          />
          Appointments
        </li>
        <li
          id="notificationsTab"
          onClick={() => setActive("notifications")}
          className={tabClass("notifications")}
        >
          <img
            src={assets.notificationicon}
            alt="requests"
            className="w-6 h-6 mr-3 inline-block"
          />
          Notifications
        </li>
        <li
          id="reviewsTab"
          onClick={() => setActive("reviews")}
          className={tabClass("reviews")}
        >
          <img
            src={assets.reviewIcon}
            alt="requests"
            className="w-6 h-6 mr-3 inline-block"
          />
          Reviews
        </li>
        <li
          id="complaintsTab"
          onClick={() => setActive("complaints")}
          className={tabClass("complaints")}
        >
          <img
            src={assets.complaintIcon}
            alt="requests"
            className="w-6 h-6 mr-3 inline-block"
          />
          Complaints
        </li>
      </ul>

      <div className="flex-1 pl-6">
        <div
          id="dashboardContent"
          className={`tab-content w-full mt-4 ${
            active === "dashboard" ? "block" : "hidden"
          }`}
        >
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">
            Bienvenido, Administrador
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {" "}
            Tabla de Logs
          </h2>
          <Dashboard />
        </div>

        <div
          id="usersContent"
          className={`tab-content w-full mt-4 ${
            active === "users" ? "block" : "hidden"
          }`}
        >
          <UsersData />
        </div>

        <div
          id="professionalsContent"
          className={`tab-content w-full mt-4 ${
            active === "professionals" ? "block" : "hidden"
          }`}
        >
          <ProfessionalsData />
        </div>
        <div
          id="servicesContent"
          className={`tab-content w-full mt-4 ${
            active === "services" ? "block" : "hidden"
          }`}
        >
          <ServicesData />
        </div>
        <div
          id="requestsContent"
          className={`tab-content w-full mt-4 ${
            active === "requests" ? "block" : "hidden"
          }`}
        >
          <RequestsData />
        </div>
        <div
          id="appoinmentsContent"
          className={`tab-content w-full mt-4 ${
            active === "appointments" ? "block" : "hidden"
          }`}
        >
          <AppointmentsData />
        </div>
        <div
          id="notificationsContent"
          className={`tab-content w-full mt-4 ${
            active === "notifications" ? "block" : "hidden"
          }`}
        >
          <NoitificationsData />
        </div>
        <div
          id="reviewsContent"
          className={`tab-content w-full mt-4 ${
            active === "reviews" ? "block" : "hidden"
          }`}
        >
          <ReviewsData />
        </div>
        <div
          id="complaintsContent"
          className={`tab-content w-full mt-4 ${
            active === "complaints" ? "block" : "hidden"
          }`}
        >
          <ComplaintsData />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
