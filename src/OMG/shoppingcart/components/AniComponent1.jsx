import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import AniComponent2 from "./AniComponent2";

const AniComponent1 = ({ onClose }) => {
  const [showComponent2, setShowComponent2] = useState(false);
  const component1Ref = useRef(null);
  const component2Ref = useRef(null);
  useEffect(() => {
    // Blob-like morphing effect for Component1
    gsap.fromTo(
      component1Ref.current,
      {
        scale: 0.6, // Start smaller
        opacity: 0,
        clipPath: "circle(20% at 50% 50%)", // Start as a circular shape
      },
      {
        scale: 1, // Expand to full size
        opacity: 1,
        clipPath: "circle(80% at 50% 50%)", // Gradually grow to a larger, less circular shape
        duration: 1.5,
        ease: "power3.out", // Smooth easing for blob-like expansion
      }
    );
  }, []);

  const handleCheckout = () => {
    gsap.to(component1Ref.current, {
      width: "calc(100% - 600px)",
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: () => setShowComponent2(true),
    });
  };

  const handleCloseComponent1 = () => {
    gsap.to(component1Ref.current, {
      scale: 0,
      opacity: 0,
      clipPath: "circle(20% at 50% 50%)",
      duration: 0.6,
      ease: "power3.in",
      onComplete: onClose,
    });
  };

  return (
    <>
      <div
        ref={component1Ref}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "#f5f5f5",
          zIndex: 10,
        }}
      >
        <button onClick={handleCloseComponent1}>Close</button>
        <button onClick={handleCheckout}>Checkout</button>
      </div>
      {showComponent2 && (
        <AniComponent2
          onClose={() => {
            // Reverse Component1 shrink on Component2 close
            gsap.to(component1Ref.current, {
              width: "100%",
              duration: 0.6,
              ease: "power3.inOut",
            });
            setShowComponent2(false);
          }}
          ref={component2Ref}
        />
      )}
    </>
  );
};

export default AniComponent1;

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import AniComponent2 from "./AniComponent2.jsx";
// import "./AniComponent1.css";

// const Component1 = ({ onClose }) => {
//   const [showCheckout, setShowCheckout] = useState(false);

//   // Animation variants for Component1
//   const component1Variants = {
//     initial: { opacity: 0, scale: 0.5, x: "100%" },
//     animate: {
//       opacity: 1,
//       scale: 1,
//       x: "0%",
//       transition: { type: "spring", duration: 0.5 },
//     },
//     shiftLeft: {
//       x: "-600px",
//       scale: 1,
//       opacity: 1,
//       transition: { duration: 0.5 },
//     }, // Shift left without disappearing
//   };

//   // Animation variants for CheckoutComponent
//   const checkoutVariants = {
//     initial: { opacity: 0, y: "100%" },
//     animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//     exit: { opacity: 0, y: "100%", transition: { duration: 0.5 } },
//   };

//   const handleCheckout = () => {
//     setShowCheckout(true); // Trigger the checkout view
//   };

//   const handleClose = () => {
//     setShowCheckout(false); // Reset to show only Component1
//     onClose && onClose(); // Call parent's close function if provided
//   };
//   return (
//     <AnimatePresence>
//       <motion.div
//         className="component1"
//         variants={component1Variants}
//         initial="initial"
//         animate={showCheckout ? "shiftLeft" : "animate"}
//         exit="exit"
//       >
//         <h2>Component 1</h2>
//         <button onClick={handleCheckout}>Checkout</button>
//         <button onClick={handleClose}>Close</button>
//       </motion.div>
//       {showCheckout && (
//         <AniComponent2 onClose={handleClose} variants={checkoutVariants} />
//       )}
//     </AnimatePresence>
//   );
// };

// export default Component1;
