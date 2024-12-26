import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./IntroOverlay.css";

const words = ["Your", "Ultimate", "Fashion", "Outfits"];

export default function IntroOverlay({ onAnimationEnd }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < words.length - 1) {
      const timeout = setTimeout(() => {
        setIndex((prevIndex) => prevIndex + 1);
      }, 500); // Time each word is displayed
      return () => clearTimeout(timeout);
    } else {
      setTimeout(() => {
        onAnimationEnd(); // End animation after all words
      }, 1000);
    }
  }, [index, words.length, onAnimationEnd]);

  return (
    <motion.div
      initial={{ top: 0 }}
      animate={{ top: "-100vh" }}
      exit={{ top: "-100vh" }}
      transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 1.5 }}
      className="intro-overlay"
    >
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="word-display"
      >
        {words[index]}
      </motion.p>
    </motion.div>
  );
}
