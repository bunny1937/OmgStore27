// src/components/LoadingAnimation.jsx
import React from "react";
import "./Loader.css";
import logo from "../pages/photos/logo-black.svg";

const LoadingAnimation = () => {
  return (
    <div className="loading-animation-container">
      <img src={logo} alt="Loading..." className="logo-animation" />
    </div>
  );
};

export default LoadingAnimation;
