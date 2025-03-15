import React from "react";
import { useInView } from "react-intersection-observer";

const LazyImage = ({ src, alt, width, height, className }) => {
  // Increase rootMargin to trigger loading sooner
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: "300px 0px",
    initialInView: false,
  });

  const containerStyle = {
    width: width || "100%",
    height: height || "auto",
    minHeight: "100px",
    position: "relative",
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const placeholderStyle = {
    width: "100%",
    height: "100%",
    backgroundColor: "#e2e2e2",
    animation: "pulse 1.5s infinite ease-in-out",
    aspectRatio: width && height ? width / height : "4/3",
  };

  return (
    <div
      ref={ref}
      className={`lazy-image-container ${className || ""}`}
      style={containerStyle}
    >
      {inView || !src ? (
        <img
          src={src}
          alt={alt || "Product image"}
          loading="lazy"
          style={imageStyle}
          onError={(e) => {
            console.error(`Failed to load image: ${src}`);
            e.target.src =
              "https://via.placeholder.com/300x200?text=Image+Error";
          }}
        />
      ) : (
        <div style={placeholderStyle}></div>
      )}

      {/* Add a simple CSS animation for placeholder */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default LazyImage;
