import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FavouritesContext } from "./FavoritesContext";
import BackButtonHandler from "../../BackHandle/BackHandler";
import "./Favourites.css";

const Favourites = (onClose) => {
  BackButtonHandler(onClose);
  const {
    favouriteItems,
    notification,
    removeFavouriteItem,
    removeAllFavourites,
  } = useContext(FavouritesContext);

  return (
    <div className="favourite-section">
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
      <h2>Favourites</h2>
      {notification && <div className="notification">{notification}</div>}
      {favouriteItems.length > 0 ? (
        <ul className="fav-list">
          {favouriteItems.map((item, index) => (
            <li className="fav-list-li" key={`${item.id}-${index}`}>
              <img src={item.Img} alt={`${item.Name} image`} />
              <Link to={`/Details/${item.id}`}>
                <h4>{item.Name}</h4>
              </Link>
              <p>Size - {item.size}</p>
              <p>Quantity: {item.quantity}</p>
              <p>₹ {item.price.toLocaleString()}</p>
              <button
                className="remove-btn"
                onClick={() => removeFavouriteItem(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-items">No favourite items found.</p>
      )}
      {favouriteItems.length > 0 && (
        <button className="remove-all-btn" onClick={removeAllFavourites}>
          Remove All
        </button>
      )}
    </div>
  );
};

export default Favourites;
