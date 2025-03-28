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
import { ref, getDownloadURL } from "firebase/storage";
import { firebaseApp, storage } from "../../db/Firebase";
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
import { DetailsSkeleton } from "../pages/Skeleton";

const db = getFirestore(firebaseApp);

const Details = () => {
  const { id } = useParams(); // Get the id from the URL parameters

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const { addItem, setBuyNowItem } = useContext(cartContext);
  const { addFavourite } = useContext(FavouritesContext);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For main image
  const [popupOpen, setPopupOpen] = useState(false); // Popup state
  const { user } = useContext(UserContext); // User context
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [sizeChartUrl, setSizeChartUrl] = useState("");

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

  useEffect(() => {
    const fetchSizeChart = async () => {
      try {
        setLoading(true);

        // Check if the product category is 'Oversize' or 'Tshirts'
        const isOversize = product.Category === "Oversize";

        // Choose the correct image filename
        const chartFileName = isOversize
          ? "oversize-chart.png"
          : "regular-chart.png";

        // Reference the file in Firebase Storage
        const imageRef = ref(storage, `size-chart/${chartFileName}`);

        // Get the download URL
        const url = await getDownloadURL(imageRef);
        setSizeChartUrl(url);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchSizeChart();
  }, [product]);

  if (loading || !product) {
    return <DetailsSkeleton />;
  }
  const {
    ImgUrls = [],
    Name,
    Description,
    discountedPrice,
    originalPrice,
    Gender,
    Category,
  } = product;

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
      discountedPrice: discountedPrice,
      // originalPrice: price,
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

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to proceed to checkout.");
      setPopupOpen(true);
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size before proceeding to checkout.");
      return;
    }

    try {
      const item = {
        id,
        Img: ImgUrls[0],
        uniqueItemId: `${id}-${selectedSize}`,
        Category,
        Gender,
        Name,
        Description,
        discountedPrice: Number(discountedPrice),
        // originalPrice: Number(price),
        quantity: quantity,
        size: selectedSize,
      };

      // Instead of clearing cart and adding item, set it as buyNowItem
      setBuyNowItem(item);
      navigate("/Checkout/mode=buynow");
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("There was an error processing your request.");
    }
  };

  const handleAddToFavourites = () => {
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
      discountedPrice,
      // originalPrice
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
              <p>
                ₹{" "}
                {discountedPrice
                  ? discountedPrice.toLocaleString()
                  : "Price not available"}
              </p>
              <div className="feature-container">
                <div className="feature-item ">
                  <span>240 GSM</span>
                  <i class="fa-solid fa-check"></i>
                </div>
                <div className="feature-item ">
                  <span> FIT</span>
                  <i class="fa-solid fa-check"></i>
                </div>
                <div className="feature-item">
                  <span>100% Cotton</span>
                  <i class="fa-solid fa-check"></i>
                </div>
                <div className="feature-item ">
                  <span>DTF</span>
                  <i class="fa-solid fa-check"></i>
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
                Buy now
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
                    Size Chart
                    <ExpandMoreIcon
                      className={`expand-icon ${
                        shippingOpen ? "expanded" : ""
                      }`}
                    />
                  </h3>
                  <Collapse in={shippingOpen}>
                    <div className="accordion-content">
                      <img
                        src={sizeChartUrl}
                        alt={`${product.Category} Size Chart`}
                        className="size-chart-img"
                      />
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
