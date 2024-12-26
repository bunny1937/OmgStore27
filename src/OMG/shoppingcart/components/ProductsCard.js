import React, { useContext, useState } from "react";
// import cartContext from "../context/cartContext";
import { Link } from "react-router-dom";
import { FavouritesContext } from "./FavoritesContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductsCard = ({ id, Name, Category, price, ImgUrls }) => {
  // const { addFavourite } = useContext(FavouritesContext);
  // const [isFavourite, setIsFavourite] = useState(false);
  // const [hovered, setHovered] = useState(false);

  // const handleAddToFavourites = () => {
  //   const item = { id, Name, Category, price, ImgUrls };
  //   addFavourite(item);
  //   setIsFavourite(true);

  //   setTimeout(() => {
  //     setIsFavourite(false);
  //   }, 3000);
  // };

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
  // const mainImg = ImgUrls && ImgUrls[0];
  // const hoverImg = ImgUrls && ImgUrls[1];

  return (
    <>
      <div
        className="product_card"
        // onMouseEnter={() => setHovered(true)}
        // onMouseLeave={() => setHovered(false)}
      >
        {/* <div className="product_card_img">
          {mainImg && (
            <img
              src={hovered && hoverImg ? hoverImg : mainImg}
              alt={Name || "Product Image"}
            />
          )}
        </div> */}
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
          {id && Name ? (
            <Link to={`/Details/${id}`}>
              <h3>{Name}</h3>
            </Link>
          ) : (
            <h4>No Title Available</h4>
          )}
          <h3 className="price">₹ {price.toLocaleString()}</h3>
        </div>
        <h4>{Category}</h4>
        {/* <button
          className={`btn-fav ${isFavourite ? "favourited" : ""}`}
          onClick={handleAddToFavourites}
        >
          <div className="fav-icon1"></div>
        </button> */}
        {/* <div className="card-actions">
          <button
            type="button"
            className={`btn1 ${isAdded ? "added" : ""}`}
            data-id={id}
            onClick={handleAddToCart}
          >
            <div className="bag-icon1"></div>
          </button>
          <button
            className={`btn2 ${isFavourite ? "favourited" : ""}`}
            onClick={handleAddToFavourites}
          >
            <div className="fav-icon1"></div>
          </button>
        </div> */}
      </div>
    </>
  );
};

export default ProductsCard;
