import React, { useContext, useState } from "react";
// import cartContext from "../context/cartContext";
import { Link } from "react-router-dom";
import { FavouritesContext } from "./FavoritesContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductsCard = ({
  id,
  Name,
  Category,
  originalPrice,
  discountedPrice,
  price,
  ImgUrls,
}) => {
  const [loaded, setLoaded] = useState(false);

  const hasDiscount =
    originalPrice && discountedPrice && originalPrice > discountedPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

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
                      onLoad={() => setLoaded(true)}
                      style={{ visibility: loaded ? "visible" : "hidden" }}
                      alt={`${Name || "Product Image"} ${index + 1}`}
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              <div>No Images Available</div>
            )}
            {discountPercentage > 0 && (
              <div className="discount-tag">-{discountPercentage}%</div>
            )}
          </div>
          <div className="details-box">
            {id && Name ? <h3>{Name}</h3> : <h4>No Title Available</h4>}

            <h4>{Category}</h4>
            <div className="price-container">
              {originalPrice !== undefined ? (
                <>
                  <span className="original-price">
                    ₹ {originalPrice.toLocaleString()}
                  </span>
                  {discountedPrice !== undefined ? (
                    <p className="discounted-price">
                      ₹ {discountedPrice.toLocaleString()}
                    </p>
                  ) : (
                    <p className="price">₹ {originalPrice.toLocaleString()}</p>
                  )}
                </>
              ) : (
                <p className="price">Price unavailable</p>
              )}
            </div>
          </div>
        </Link>
      </div>
    </z>
  );
};

export default ProductsCard;
