import React, { useEffect, forwardRef } from "react";
import { gsap } from "gsap";

const AniComponent2 = forwardRef(({ onClose }, ref) => {
  useEffect(() => {
    // Create the fluid entry animation (like a blob entering)
    gsap.fromTo(
      ref.current,
      {
        x: "-100%", // Start from the right, off-screen
        scaleX: 1.2, // Start with a slight squish effect
        scaleY: 1.3, // Begin with a squished vertical scale
        opacity: 0, // Fully transparent
        clipPath: "circle(20% at 50% 50%)", // Start with a blob-like shape
      },
      {
        x: "0%", // Slide to full view
        opacity: 1, // Fade in
        scaleX: 1, // Normalize the squish to normal width
        scaleY: 1, // Normalize the squish to normal height
        clipPath: "circle(75% at 50% 50%)", // Morph the shape to a softer blob
        duration: 1.5,
        ease: "power3.out", // Smooth easing
      }
    );
  }, [ref]);

  const handleClose = () => {
    // Close animation with fluid exit (shrinking and sliding out)
    gsap.to(ref.current, {
      x: "100%", // Slide out
      scaleX: 1.2, // Stretch slightly as it exits
      scaleY: 1.3, // Give the blob a squished look again
      opacity: 0, // Fade out
      clipPath: "circle(20% at 50% 50%)", // Squish into a blob-like shape
      duration: 0.8,
      ease: "power3.in", // Smooth in easing
      onComplete: onClose, // Close after animation
    });
  };

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "600px",
        height: "100%",
        background: "#ccc",
        zIndex: 9,
        overflow: "hidden",
      }}
    >
      <button onClick={handleClose}>Close</button>
    </div>
  );
});

export default AniComponent2;
