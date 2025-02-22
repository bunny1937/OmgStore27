import React, { useContext, useState } from "react";
// import cartContext from "../context/cartContext";
import { Link } from "react-router-dom";
import { FavouritesContext } from "./FavoritesContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductsCard = ({ id, Name, Category, price, ImgUrls }) => {
  const settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    cssEase: "linear",
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <z>
      <div className="product_card">
        <Link to={`/Details/${id}`}>
          <div className="product_card_img">
            {ImgUrls && ImgUrls.length > 0 ? (
              <Slider {...settings}>
                {ImgUrls.map((imgUrl, index) => (
                  <div key={index}>
                    <img
                      src={imgUrl}
                      alt={`${Name || "Product Image"} ${index + 1}`}
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              <div>No Images Available</div>
            )}
          </div>
          <div className="details-btn">
            {id && Name ? <h3>{Name}</h3> : <h4>No Title Available</h4>}
            <h3 className="price">₹ {price.toLocaleString()}</h3>
          </div>
          <h4>{Category}</h4>
        </Link>
      </div>
    </z>
  );
};

export default ProductsCard;
