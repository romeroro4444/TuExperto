import React from "react";
import Header from "./../common/Header";
import FeaturedServices from "./../common/FeaturedServices";
import HowWork from "./HowWork";
import JoinAsProfessional from "../common/JoinAsProfessional";
import Footer from "../common/Footer";
import { Toaster } from "react-hot-toast";

const Home = () => {
  return (
    <>
      <Toaster />
      <Header />
      <FeaturedServices />
      <HowWork />
      <JoinAsProfessional />
    </>
  );
};

export default Home;
