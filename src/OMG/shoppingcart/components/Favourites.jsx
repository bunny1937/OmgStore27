import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FavouritesContext } from "./FavoritesContext";
import "./Favourites.css";

const Favourites = () => {
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    favouriteItems,
    notification,
    removeFavouriteItem,
    removeAllFavourites,
  } = useContext(FavouritesContext);

  useEffect(() => {
    // Store the previous path when component mounts
    const previousPath = location.state?.previousPath;

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        handleClose(previousPath);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [location]);

  const handleClose = (returnPath) => {
    setIsClosing(true);
    setTimeout(() => {
      // Go back in history instead of navigating to a specific path
      navigate(-1);
    }, 300);
  };

  const handleOutsideClick = (event) => {
    if (event.target.classList.contains("favourite-section")) {
      handleClose();
    }
  };

  // Prevent navigation if clicking on a card or button
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`favourite-section ${isClosing ? "closing" : "visible"}`}
      onClick={handleOutsideClick}
    >
      <div className="favourites-content">
        <button
          className="close-btn"
          onClick={() => handleClose()}
          aria-label="Close favourites"
        >
          &times;
        </button>

        <h2>Favourites</h2>

        {notification && (
          <div className="notification" role="alert">
            {notification}
          </div>
        )}

        {favouriteItems.length > 0 ? (
          <>
            <ul className="fav-list">
              {favouriteItems.map((item, index) => (
                <li
                  className="fav-list-li"
                  key={`${item.id}-${index}`}
                  onClick={handleCardClick}
                >
                  <img src={item.Img} alt={`${item.Name}`} />
                  <Link to={`/Details/${item.id}`} onClick={handleCardClick}>
                    <h4>{item.Name}</h4>
                  </Link>
                  <p>Size - {item.size}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>₹ {item.price.toLocaleString()}</p>
                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavouriteItem(item.id);
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <button
              className="remove-all-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeAllFavourites();
              }}
            >
              Remove All
            </button>
          </>
        ) : (
          <p className="no-items">No favourite items found.</p>
        )}
      </div>
    </div>
  );
};

export default Favourites;
