import React, { useState } from "react";
import "./Bento.css";
import Asthetics1 from "../shoppingcart/components/pages/photos/parallax/man-poses-in-light-colored-overcoat.jpg";
import Asthetics2 from "../shoppingcart/components/pages/photos/parallax/man-wearing-white-shirt-with-tattoo-his-arm-words-hes-man-left_1045176-14545-transformed.jpeg";
import Spiritual1 from "../shoppingcart/components/pages/photos/parallax/premium_photo-1690341214258-18cb88438805-transformed.jpeg";
import Spiritual2 from "../shoppingcart/components/pages/photos/parallax/woman-4266713_640.jpg";
const products = [
  {
    id: 1,
    image: Asthetics1,
    title: "Product 1",
    description: "hsiahdaoidhwoidqwjodiqhwdiqwhdoiwh",
  },
  {
    id: 2,
    image: Asthetics2,
    title: "Product 2",
    description: "Description 2",
  },
  {
    id: 3,
    image: Spiritual1,
    title: "Product 3",
    description: "Description 3",
  },
  {
    id: 4,
    image: Spiritual2,
    title: "Product 4",
    description: "Description 4",
  },
  {
    id: 5,
    image: "image5.jpg",
    title: "Product 5",
    description: "Description 5",
  },
];

const ProductSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(2);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="slider-container">
      <button className="slider-button left" onClick={handlePrev}>
        &#10094;
      </button>
      <div className="slider">
        {products.map((product, index) => {
          const position =
            (index - currentIndex + products.length) % products.length;

          let className = "";
          if (position === 0 || position === products.length - 1) {
            className = "small";
          } else if (position === 1 || position === products.length - 2) {
            className = "medium";
          } else if (position === 2) {
            className = "big";
          }

          return (
            <div key={product.id} className={`slide ${className}`}>
              <img src={product.image} alt={product.title} />
            </div>
          );
        })}
      </div>
      <button className="slider-button right" onClick={handleNext}>
        &#10095;
      </button>
      <div className="description-container">
        <h2>{products[currentIndex].title}</h2>
        <p>{products[currentIndex].description}</p>
      </div>
    </div>
  );
};

export default ProductSlider;
