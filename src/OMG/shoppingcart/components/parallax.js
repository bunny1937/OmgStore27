import React from "react";
import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import "./parallax.css";
import pic1 from "./pages/photos/FTilgxjaIAEf0ws.jpg";
import pic2 from "./pages/photos/03dab10d1c848bdd2b16b648b1a20d4b.jpg";
import pic3 from "./pages/photos/8029fab1b341c1bd7957dba0c32efa93.jpg";
import pic4 from "./pages/photos/2149208350.jpg";
import pic5 from "./pages/photos/102239.jpg";
import pic6 from "./pages/photos/1174.jpg";
import pic7 from "./pages/photos/jeanspic.jpg";
import pic8 from "./pages/photos/2148148224.jpg";
const slider1 = [
  {
    color: "#e3e5e7",
    img: pic1,
  },
  {
    color: "#d6d7dc",
    img: pic2,
  },
  {
    color: "#e3e3e3",
    img: pic3,
  },
  {
    color: "#21242b",
    img: pic4,
  },
];

const slider2 = [
  {
    color: "#d4e3ec",
    img: pic5,
  },
  {
    color: "#e5e0e1",
    img: pic6,
  },
  {
    color: "#d7d4cf",
    img: pic7,
  },
  {
    color: "#e1dad6",
    img: pic8,
  },
];

export default function Imagesone() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const x2 = useTransform(scrollYProgress, [0, 1], [300, -50]);
  const height = useTransform(scrollYProgress, [0, 0.9], [50, 0]);

  return (
    <div ref={container} className="slidingImages">
      <motion.div style={{ x: x1 }} className="slider">
        {slider1.map((project, index) => {
          return (
            <div
              key={index}
              className="project"
              style={{ backgroundColor: project.color }}
            >
              <div className="imageContainer">
                <img src={project.img} alt="project1" />
              </div>
            </div>
          );
        })}
      </motion.div>
      <motion.div style={{ x: x2 }} className="slider">
        {slider2.map((project, index) => {
          return (
            <div
              key={index}
              className="project"
              style={{ backgroundColor: project.color }}
            >
              <div key={index} className="imageContainer">
                <img src={project.img} alt="project2" />
              </div>
            </div>
          );
        })}
      </motion.div>
      <motion.div style={{ height }} className="circleContainer">
        <div className="circle"></div>
      </motion.div>
    </div>
  );
}
