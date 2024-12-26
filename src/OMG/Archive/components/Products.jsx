import React, { useState } from "react";
import Product from "./Product";
import { motion } from "framer-motion";
import img1 from "../assets/2149208350.jpg";
import img2 from "../assets/2148148224.jpg";
import img3 from "../assets/jeanspic.jpg";
import img4 from "../assets/1174.jpg";
import img5 from "../assets/businessman-1284460_640.jpg";

function Products() {
  var products = [
    {
      title: "Arqitel",
      live: true,
      case: false,
    },
    {
      title: "TTR",
      live: true,
      case: false,
    },
    {
      title: "YIR 2022",
      live: true,
      case: false,
    },
    {
      title: "Yahoo!",
      live: true,
      case: true,
    },
    {
      title: "Rainfall",
      live: true,
      case: true,
    },
  ];

  const [pos, setPos] = useState(0);
  const mover = (val) => {
    setPos(val * 23);
  };

  return (
    <div className="mt-32 relative">
      {products.map((val, index) => (
        <Product key={index} val={val} mover={mover} count={index} />
      ))}
      <div className="absolute top-0 w-full h-full pointer-events-none">
        <motion.div
          initial={{ y: pos, x: "-50%" }}
          animate={{ y: pos + `rem` }}
          transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.6 }}
          className="window absolute w-[32rem] h-[23rem] left-[44%] rounded-3xl overflow-hidden"
        >
          <motion.div
            animate={{ y: -pos + `rem` }}
            transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.5 }}
            className="w-full h-full"
          >
            <img
              className="absolute object-cover rounded-3xl"
              src={img1}
              alt="Arqitel"
            />
          </motion.div>
          <motion.div
            animate={{ y: -pos + `rem` }}
            transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.5 }}
            className="w-full h-full"
          >
            <img
              className="absolute object-cover rounded-3xl"
              src={img2}
              alt="TTR"
            />
          </motion.div>
          <motion.div
            animate={{ y: -pos + `rem` }}
            transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.5 }}
            className="w-full h-full"
          >
            <img
              className="absolute object-cover rounded-3xl"
              src={img3}
              alt="YIR 2022"
            />
          </motion.div>
          <motion.div
            animate={{ y: -pos + `rem` }}
            transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.5 }}
            className="w-full h-full"
          >
            <img
              className="absolute object-cover rounded-3xl"
              src={img4}
              alt="Yahoo!"
            />
          </motion.div>
          <motion.div
            animate={{ y: -pos + `rem` }}
            transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.5 }}
            className="w-full h-full"
          >
            <img
              className="absolute object-cover rounded-3xl"
              src={img5}
              alt="Rainfall"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Products;
