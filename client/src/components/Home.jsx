import React from "react";
import Header from "./Header";
import FeaturedServices from "./FeaturedServices";
import HowWork from "./HowWork";
import JoinAsProfessional from "./JoinAsProfessional";
import Footer from "./Footer";
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
