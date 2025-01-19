import React from "react";
import "./Mainpage.css";
import Asthetics1 from "../shoppingcart/components/pages/photos/parallax/man-poses-in-light-colored-overcoat.jpg";
import Asthetics2 from "../shoppingcart/components/pages/photos/parallax/man-wearing-white-shirt-with-tattoo-his-arm-words-hes-man-left_1045176-14545-transformed.jpeg";
import Spiritual1 from "../shoppingcart/components/pages/photos/parallax/premium_photo-1690341214258-18cb88438805-transformed.jpeg";
import Spiritual2 from "../shoppingcart/components/pages/photos/parallax/woman-4266713_640.jpg";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeInBottom = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeInTop = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Mainpage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <motion.div
        className="landing-partition aesthetic"
        initial="initial"
        animate="animate"
        onClick={() => navigate("/products/Minimalist")}
        style={{ cursor: "pointer" }}
      >
        <div className="landing-content">
          <motion.div
            className="landing-image-container"
            variants={fadeInBottom}
          >
            <img
              src={Asthetics1}
              alt="Aesthetic Product 1"
              className="landing-image"
            />
            <img
              src={Asthetics2}
              alt="Aesthetic Product 2"
              className="landing-image"
            />
          </motion.div>
          <p className="landing-description">
            Elevate your space with our curated collection of minimalist
            designs.
          </p>
        </div>
        <h1 className="landing-title aesthetic-title">Minimalist</h1>
      </motion.div>
      <motion.div
        className="landing-partition spiritual"
        initial="initial"
        animate="animate"
        onClick={() => navigate("/products/Spiritual")}
        style={{ cursor: "pointer" }}
      >
        <h1 className="landing-title spiritual-title">Divine</h1>
        <motion.div className="landing-content2" variants={fadeInTop}>
          <p className="landing-description2">
            Discover tranquility, faith and inner peace through our spiritual
            treasures.
          </p>
          <div className="landing-image-container">
            <img
              src={Spiritual1}
              alt="Spiritual Product 1"
              className="landing-image"
            />
            <img
              src={Spiritual2}
              alt="Spiritual Product 2"
              className="landing-image"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Mainpage;
