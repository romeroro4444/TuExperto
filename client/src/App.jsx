import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Services from "./components/Services";
import Requests from "./components/Requests";
import MyServices from "./components/MyServices";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import EditService from "./components/EditService";
import MyRequests from "./components/MyRequests";
import EditRequest from "./components/EditRequest";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  const isAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:4000/verify", {
        method: "GET",
        headers: { token },
      });
      const parseRes = await response.json();
      setIsAuthenticated(parseRes === true);
    } catch (error) {
      setIsAuthenticated(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    isAuth();
  }, []);

  const [tipoUsuario, setTipoUsuario] = useState(null);

  useEffect(() => {
    const fetchTipoUsuario = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setTipoUsuario(null);
        return;
      }
      try {
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
    if (isAuthenticated) fetchTipoUsuario();
  }, [isAuthenticated]);

  return (
    <div className="w-full overflow-hidden">
      <BrowserRouter>
        <Navbar setAuth={setAuth} isAuthenticated={isAuthenticated} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/mis-servicios"
            element={
              isAuthenticated && tipoUsuario === "PROFESIONAL" ? (
                <MyServices />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/mis-solicitudes"
            element={
              isAuthenticated && tipoUsuario === "CLIENTE" ? (
                <MyRequests />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/edit-request/:request_id"
            element={
              isAuthenticated && tipoUsuario === "CLIENTE" ? (
                <EditRequest />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/services" element={<Services />} />
          <Route path="/requests" element={<Requests />} />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login setAuth={setAuth} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <Register setAuth={setAuth} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              !isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Profile setAuth={setAuth} tipo_usuario={tipoUsuario} />
              )
            }
          />
          <Route
            path="/edit-profile"
            element={<EditProfile tipo_usuario={tipoUsuario} />}
          />
          <Route
            path="/edit-service/:service_id"
            element={
              isAuthenticated && tipoUsuario === "PROFESIONAL" ? (
                <EditService />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
};

export default App;
