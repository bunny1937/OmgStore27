import React, { useRef } from "react";
import "./Loadergsap.css";
import Picture1 from "./pages/photos/parallax/Vmake-1731610471.jpg";
import Picture2 from "./pages/photos/parallax/businessman-1284460_640.jpg";
import Picture3 from "./pages/photos/parallax/man-1283231_640.jpg";
import Picture4 from "./pages/photos/parallax/model-2865587_640.jpg";
import Picture5 from "./pages/photos/parallax/fashion-3080626_640.jpg";
import Picture6 from "./pages/photos/parallax/woman-3946473_640.jpg";
import Picture7 from "./pages/photos/parallax/woman-1721065_640.jpg";
import Picture8 from "./pages/photos/parallax/pexels-rfera-432059.jpg";
import Picture9 from "./pages/photos/parallax/man-in-white-and-light-tan-outfit.jpg";
import Picture10 from "./pages/photos/parallax/pexels-olly-837140.jpg";
import { useScroll, useTransform, motion } from "framer-motion";

const ImageGallery = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);
  const scale10 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale11 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale12 = useTransform(scrollYProgress, [0, 1], [1, 5]);

  const pictures = [
    { src: Picture1, scale: scale4 },
    { src: Picture2, scale: scale5 },
    { src: Picture3, scale: scale6 },
    { src: Picture4, scale: scale5 },
    { src: Picture5, scale: scale6 },
    { src: Picture6, scale: scale8 },
    { src: Picture7, scale: scale9 },
    { src: Picture8, scale: scale10 },
    { src: Picture9, scale: scale11 },
    { src: Picture10, scale: scale12 },
  ];

  return (
    <div ref={containerRef} className="container">
      <div className="sticky">
        {pictures.map(({ src, scale }, index) => (
          <motion.div key={index} style={{ scale }} className="el">
            <div className="imageContainer">
              <img src={src} alt={`gallery image ${index + 1}`} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
