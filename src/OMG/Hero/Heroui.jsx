import React, { useState, useEffect } from "react";
import "./Heroui.css";
import Footer from "../shoppingcart/components/Footer";
import Category from "./Category/Category";
import SuggestionComponent from "../shoppingcart/components/Suggestion";
import IntroOverlay from "./IntroOverlay";
import Carouselwheeel from "./Caraouselwheeel";
import Mainpage1 from "./Mainpage1";
export default function Heroui() {
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem("introShown") !== "true";
  });

  useEffect(() => {
    if (showIntro) {
      // Set sessionStorage only if intro is shown
      sessionStorage.setItem("introShown", "true");
    }
  }, [showIntro]);

  const handleAnimationEnd = () => {
    setShowIntro(false); // Hide the intro after animation
  };

  return (
    <>
      {showIntro ? (
        <IntroOverlay onAnimationEnd={handleAnimationEnd} />
      ) : (
        <div className="hero">
          <Mainpage1 />
          <Carouselwheeel />
          <Category />
          <SuggestionComponent />
          <Footer />
        </div>
      )}
    </>
  );
}
