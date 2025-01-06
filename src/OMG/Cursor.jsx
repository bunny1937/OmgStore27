import React, { useEffect, useState } from "react";

const Cursor = () => {
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Initialize cursor behavior
    const cursors = document.querySelectorAll(".cursor");

    const handleMouseMove = (e) => {
      cursors.forEach((cursor) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });
    };
    // Mouse enter/leave handlers for hover effect
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    const hoverElements = document.querySelectorAll(".hover-target");
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });
    const handleMouseDown = () => {
      document.body.classList.add("is-dragging");
    };

    const handleMouseUp = () => {
      document.body.classList.remove("is-dragging");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      hoverElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  // Hide the default cursor globally using inline CSS
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      body {
        cursor: none; /* Hides default cursor */
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <>
      {/* Main Custom Cursor */}
      <div
        className={`cursor ${isHovering ? "hovering" : ""}`}
        style={{
          position: "fixed",
          zIndex: 10,
          top: 0,
          left: 0,
          width: isHovering ? "60px" : "40px", // Increase size on hover
          height: isHovering ? "60px" : "40px",
          borderRadius: "50%",
          border: "2px solid rgba(52, 52, 52, 0.77)",
          backgroundColor: isHovering
            ? "rgba(255, 0, 0, 0.1)"
            : " rgba(88, 88, 88, 0.14)",
          margin: "-20px 0 0 -20px",
          pointerEvents: "none",
          transition: "transform 0.85s cubic-bezier(0, 0.02, 0, 1)",
        }}
      ></div>

      {/* Secondary Cursor */}
      <div
        className={`cursor cursor2 ${isHovering ? "hovering" : ""}`}
        style={{
          position: "fixed",
          zIndex: 10,
          top: 0,
          left: 0,
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          backgroundColor: isHovering ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.63)",
          margin: "-1px 0 0 -1px",
          pointerEvents: "none",
          transition: "transform 0.3s ease",
        }}
      ></div>
    </>
  );
};

export default Cursor;
