import React, { useState, useEffect } from "react";
import "./Heroui.css";
import Footer from "../shoppingcart/components/Footer";
import Category from "./Category/Category";
import SuggestionComponent from "../shoppingcart/components/Suggestion";
import MainPage from "./Mainpage";
import IntroOverlay from "./IntroOverlay";
import Carouselwheeel from "./Caraouselwheeel";
import CategoryShowcase from "./Categoryshowcase";
import Lenis from "../shoppingcart/components/Lenis";
import ImageGallery from "../shoppingcart/components/Loadergsap";
import InfiniteMenu from "../shoppingcart/components/infinite/InfiniteMenu";
import UImain from "../shoppingcart/components/infinite/UImain";
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
          <MainPage />
          {/* <UImain /> */}
          <Carouselwheeel />
          <ImageGallery />
          <Category />
          <SuggestionComponent />
          <Footer />
        </div>
      )}
    </>
  );
}
