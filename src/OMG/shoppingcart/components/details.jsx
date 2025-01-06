import React, { useState, useContext, useEffect } from "react";
import "./details.css";
import cartContext from "../context/cartContext";
import Cart from "./Cart";
import { Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FavouritesContext } from "./FavoritesContext";
import SimilarProducts from "./SimilarProducts";
import ReviewSection from "./ReviewSection";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../db/Firebase";
import { useParams, useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaRegHeart } from "react-icons/fa";
import SignIn from "../../Auth/SignIn";
import SignInSignUpPopup from "../../Auth/Popupsignin";
import UserContext from "../../Auth/UserContext";
import toast, { Toaster } from "react-hot-toast";
import { auth } from "../../db/Firebase";
import { onAuthStateChanged } from "firebase/auth";

const db = getFirestore(firebaseApp);

const Details = () => {
  const { id } = useParams(); // Get the id from the URL parameters

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const { addItem } = useContext(cartContext);
  const { addFavourite } = useContext(FavouritesContext);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For main image
  const [popupOpen, setPopupOpen] = useState(false); // Popup state
  const { user } = useContext(UserContext); // User context
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { cartItems } = useContext(cartContext);
  // Fetch product based on id
  useEffect(() => {
    if (id) {
      const productsRef = collection(db, "Products");
      const productRef = doc(productsRef, id);

      getDoc(productRef)
        .then((doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setProduct(data);
            setSelectedImage(data.ImgUrls[0]); // Set the first image as default
          } else {
            console.log("Product not found!");
          }
        })
        .catch((error) => {
          console.error("Error fetching product:", error);
        });
    }
  }, [id]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (!product) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  const { ImgUrls = [], Name, Description, price, Gender, Category } = product;

  const handleAddToCart = () => {
    console.log("Selected size is:", selectedSize); // Debugging the size value
    console.log("Checking user context:", user); // Debugging user status
    if (!user) {
      console.log("User not logged in. Opening popup.");
      toast.error("Please sign in to add items to your cart.");
      setPopupOpen(true);
      return;
    }

    if (!selectedSize) {
      console.log("No size selected");
      toast.dismiss(); // Dismiss any existing toasts
      console.log("Selected size is:", selectedSize); // Should log null, undefined, or an empty value
      toast.error("Please select a size before adding to cart.");
      return;
    }

    const item = {
      id,
      Img: ImgUrls[0],
      uniqueItemId: `${id}-${selectedSize}`,

      Category,
      Gender,
      Name,
      Description,
      price,
      quantity,
      size: selectedSize,
    };
    addItem(item);
    toast.success("Item successfully added to the cart!");
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 3000);
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in to proceed to checkout.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Add items to proceed.");
      return;
    }

    // Proceed to checkout
    navigate("/Checkoutold");
  };

  const handleAddToFavourites = () => {
    console.log("Selected size is:", selectedSize); // Debugging the size value

    if (!user) {
      setPopupOpen(true);
      toast.error("Please sign in to add items to favourites.");
      return;
    }

    if (!selectedSize) {
      toast.dismiss(); // Dismiss any existing toasts
      toast.error("Please select a size before adding to favourites.");
      return;
    }

    const favouriteItem = {
      id,
      Img: ImgUrls[0], // Only the first image
      Category,
      Name,
      price,
      size: selectedSize, // Selected size
      quantity,
    };

    addFavourite(favouriteItem);
    toast.success("Item successfully added to favorites!");
    setIsFavourite(true);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const toggleContent = (type) => {
    if (type === "description") {
      setDescriptionOpen(!descriptionOpen);
    } else if (type === "shipping") {
      setShippingOpen(!shippingOpen);
    }
  };

  const handleThumbnailClick = (imgUrl) => {
    setSelectedImage(imgUrl); // Update main image when thumbnail is clicked
  };

  // const settings = {
  //   infinite: true,
  //   autoplay: true,
  //   autoplaySpeed: 3000,
  //   arrows: true,
  //   cssEase: "linear",
  //   speed: 500,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  // };
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: "16px",
            borderRadius: "8px",
            background: "#333",
            color: "#fff",
          },
          success: {
            style: { background: "#4caf50", color: "#fff" },
            iconTheme: { primary: "#fff", secondary: "#4caf50" },
          },
          error: {
            style: { background: "#f44336", color: "#fff" },
            iconTheme: { primary: "#fff", secondary: "#f44336" },
          },
        }}
      />
      <div className="details">
        <div className="details-container">
          <div className="img-section">
            {/* Thumbnails Section */}
            <div className="thumbnails">
              {ImgUrls.map((url, index) => (
                <div
                  key={index}
                  className={`thumbnail ${
                    selectedImage === url ? "active" : ""
                  }`}
                  onClick={() => handleThumbnailClick(url)}
                >
                  <img src={url} alt={`Thumbnail ${index}`} />
                </div>
              ))}
            </div>

            {/* Main Image Section */}
            <div className="main-image">
              <img src={selectedImage} alt="Selected product" />
            </div>
          </div>
          <div className="details-section">
            <div className="details-actions">
              <h2>{Name}</h2>
              <h3>{Category}</h3>
              <p>₹ {price ? price.toLocaleString() : "Price not available"}</p>
              <div className="feature-container">
                <div className="feature-item ">
                  <span>240 GSM</span>
                  <img src="icon1.svg" alt="240 GSM Icon" />
                </div>
                <div className="feature-item ">
                  <span> FIT</span>
                  <img src="icon2.svg" alt="Oversized Fit Icon" />
                </div>
                <div className="feature-item">
                  <span>UNISEX</span>
                  <img src="icon3.svg" alt="Unisex Icon" />
                </div>
                <div className="feature-item ">
                  <span>DTF</span>
                  <img src="icon4.svg" alt="DTF Icon" />
                </div>
              </div>

              <div className="size-box">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${
                      selectedSize === size ? "selected" : ""
                    }`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="quantity">
                <button onClick={handleDecrement}>-</button>
                <p>{quantity}</p>
                <button onClick={handleIncrement}>+</button>
              </div>

              <div className="cart-fav-box">
                {!selectedSize && (
                  <h6
                    className="error-message"
                    style={{ position: "absolute" }}
                  >
                    Size is required to add to cart.
                  </h6>
                )}
                <button
                  type="button"
                  className={`btn1 ${isAdded ? "added" : ""}`}
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                >
                  {isAdded ? "Added" : "Add to cart"}
                </button>
                <button
                  type="button"
                  className={`btn2 ${isFavourite ? "Added !" : ""}`}
                  onClick={handleAddToFavourites}
                  disabled={!selectedSize}
                >
                  <FaRegHeart />
                </button>
              </div>
              <button onClick={handleCheckout} className="details-checkout">
                Checkout
              </button>
            </div>
            <div className="description-box">
              <div className="prod-details">
                <h3>Product Details</h3>
              </div>
              <div className="details-accordion">
                <div>
                  <h3
                    onClick={() => toggleContent("description")}
                    className="accordion-header"
                  >
                    Product Description
                    <ExpandMoreIcon
                      className={`expand-icon ${
                        descriptionOpen ? "expanded" : ""
                      }`}
                    />
                  </h3>
                  <Collapse in={descriptionOpen}>
                    <div className="accordion-content">
                      <p>{Description}</p>
                    </div>
                  </Collapse>
                </div>

                <div>
                  <h3
                    onClick={() => toggleContent("shipping")}
                    className="accordion-header"
                  >
                    Shipping & Returns
                    <ExpandMoreIcon
                      className={`expand-icon ${
                        shippingOpen ? "expanded" : ""
                      }`}
                    />
                  </h3>
                  <Collapse in={shippingOpen}>
                    <div className="accordion-content">
                      <p>
                        This is the shipping and return details. Add details
                        such as estimated delivery time, return policy, etc.
                      </p>
                    </div>
                  </Collapse>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ReviewSection />
        <Cart />

        <div className="similar-details">
          <SimilarProducts category={Category} id={id} />
        </div>
        {popupOpen && (
          <>
            <SignInSignUpPopup
              onClose={() => setPopupOpen(false)}
              signIn={SignIn}
            />
          </>
        )}
      </div>
    </>
  );
};
export default Details;
