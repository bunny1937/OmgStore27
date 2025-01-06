import React, { useState, useEffect, useRef } from "react";
import "./CategoryShowcase.css";

const CategoryShowcase = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const questionRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      if (questionRef.current) {
        const rect = questionRef.current.getBoundingClientRect();
        const scrollPercentage = Math.max(
          0,
          Math.min(1, 1 - rect.bottom / window.innerHeight)
        );
        setScrollProgress(scrollPercentage);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="category-question" ref={questionRef}>
        <h3 style={{ "--fill-percentage": `${scrollProgress * 150}%` }}>
          Which style resonates with you?
        </h3>
        {/* <p style={{ "--fill-percentage": `${scrollProgress * 100}%` }}>
          Choose your path and explore our curated collections
        </p> */}
      </div>
      <div className={`category-showcase ${isLoaded ? "loaded" : ""}`}>
        <div
          className={`category-half minimalist ${
            hoveredCategory === "minimalist" ? "hovered" : ""
          }`}
          onMouseEnter={() => setHoveredCategory("minimalist")}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div className="category-content">
            <div className="category-icon minimalist-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="8" />
              </svg>
            </div>
            <h2>Minimalist & Aesthetic</h2>
            <p>Embrace simplicity and elegance</p>
            <button className="category-button">Explore Minimalist</button>
          </div>
          <div className="floating-elements minimalist">
            <div className="float-item circle"></div>
            <div className="float-item square"></div>
            <div className="float-item triangle"></div>
          </div>
        </div>
        <div
          className={`category-half spiritual1 ${
            hoveredCategory === "spiritual1" ? "hovered" : ""
          }`}
          onMouseEnter={() => setHoveredCategory("spiritual1")}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div className="category-content">
            <div className="category-icon spiritual1-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2>Spiritual & Faith</h2>
            <p>Celebrate your beliefs with style</p>
            <button className="category-button">Explore Spiritual</button>
          </div>
          <div className="floating-elements spiritual1">
            <div className="float-item om"></div>
            <div className="float-item lotus"></div>
            <div className="float-item mandala"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryShowcase;
