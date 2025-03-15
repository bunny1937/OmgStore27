import { useContext, useState, useEffect } from "react";
import cartContext from "../context/cartContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaHeart,
  FaTag,
  FaCheck,
} from "react-icons/fa";
import { firestore, db } from "../../db/Firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import "./Checkoutnew.css";
import LazyImage from "../../admin/Components/LazyLoad";
import { useWishlist } from "./Wishlist";

const Checkoutnew = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ["Overview", "Payment"];
  const { cartItems, removeItem, buyNowItem } = useContext(cartContext);
  const [userId, setUserId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const {
    incrementItem,
    decrementItem,
    incrementBuyNowItem,
    decrementBuyNowItem,
    removeBuyNowItem,
    clearCart,
    dispatch,
  } = useContext(cartContext);
  const [userInfo, setUserInfo] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    city: "",
    flat: "",
    locality: "",
    name: "",
    number: "",
    pinCode: "",
    state: "",
    street: "",
  });
  const navigate = useNavigate();
  const { mode } = useParams();
  const [checkoutMode, setCheckoutMode] = useState(mode);
  const [localItems, setLocalItems] = useState([]);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [localCouponCode, setLocalCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [addressExpanded, setAddressExpanded] = useState(false);
  const wishlistContext = useWishlist();
  const [activeTab, setActiveTab] = useState("cart");
  const {
    wishlistItems = [],
    addToWishlist = () => {},
    removeFromWishlist = () => {},
    isInWishlist = () => false,
  } = wishlistContext || {};

  const availableCoupons = [
    {
      code: "BUY2GET10",
      description: "Buy 2 get 10% off",
      minItems: 2,
      discountType: "percenFaTage",
      value: 10,
    },
    {
      code: "BUY3GET20",
      description: "Buy 3 get 20% off",
      minItems: 3,
      discountType: "percenFaTage",
      value: 20,
    },
    {
      code: "BUY4GET1FREE",
      description: "Buy 4 get 1 free (5th item free)",
      minItems: 5,
      discountType: "itemFree",
      value: 1,
    },
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
        }
      } else {
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const usersRef = collection(db, "users");
          const querySnapshot = await getDocs(usersRef);
          const userDoc = querySnapshot.docs.find(
            (doc) => doc.data().uid === user.uid
          );

          if (userDoc) {
            const userData = userDoc.data();
            setUserId(userDoc.id);
            setUserInfo(userData);
            setShippingInfo((prevState) => ({
              ...prevState,
              name: userData.firstName,
              email: userData.email || "",
              number: userData.phoneNumber || "",
              flat: prevState.flat || "",
              street: prevState.street || "",
              locality: prevState.locality || "",
              city: prevState.city || "",
              pinCode: prevState.pinCode || "",
              state: prevState.state || "",
            }));
          }
        } catch (error) {
          toast.error("Failed to load user information");
        }
      } else {
        setUserId(null);
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchAddresses = async () => {
        try {
          const addressesRef = collection(db, "users", userId, "ShippingInfo");
          const snapshot = await getDocs(addressesRef);
          const addresses = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSavedAddresses(addresses);
        } catch (error) {
          toast.error("Error loading saved addresses");
        }
      };
      fetchAddresses();
    }
  }, [userId]);

  // useEffect(() => {
  //   if (favouriteItems) {
  //     setLocalFavorites(favouriteItems);
  //   }
  // }, [favouriteItems]);
  // useEffect(() => {
  //   console.log("Favorites from context:", favouriteItems);
  //   setLocalFavorites(favouriteItems || []);
  // }, [favouriteItems]);

  useEffect(() => {
    if (mode === "mode=buynow" && buyNowItem) {
      setLocalItems([buyNowItem]);
      setCheckoutMode("buynow");
    } else if (cartItems.length > 0) {
      setLocalItems(cartItems);
      setCheckoutMode("cart");
    }
  }, [mode, buyNowItem, cartItems]);

  useEffect(() => {
    const handleModeChange = () => {
      if (checkoutMode === "buynow") {
        if (!buyNowItem) {
          if (cartItems.length > 0) {
            setCheckoutMode("cart");
            setLocalItems(cartItems);
            navigate("/checkout", { replace: true });
          } else {
            dispatch({ type: "TOGGLE_CART" });
          }
        }
      } else if (checkoutMode === "cart") {
        if (cartItems.length === 0) {
          if (buyNowItem) {
            setCheckoutMode("buynow");
            setLocalItems([buyNowItem]);
            navigate("/checkout/mode=buynow", { replace: true });
          } else {
            dispatch({ type: "TOGGLE_CART" });
          }
        }
      }
    };

    handleModeChange();
  }, [buyNowItem, cartItems, checkoutMode, navigate]);

  const itemsToDisplay = localItems;

  const handleInputChange = (e) => {
    setShippingInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userId) {
      const userOrderRef = collection(
        firestore,
        "users",
        userId,
        "ShippingInfo"
      );
      const orderData = {
        ...shippingInfo,
      };

      try {
        await addDoc(userOrderRef, orderData);
        toast.success("Shipping information saved successfully.");
        setShowForm(false);
        setShippingInfo({});
        setSavedAddresses((prev) => [...prev, { ...orderData }]);
        setAddressExpanded(false);
      } catch (error) {
        toast.error("Error saving order data:", error);
      }
    } else {
      toast.error("Please login to save shipping information.");
    }
  };

  const handleAddressSelection = (addressId) => {
    const address = savedAddresses.find((addr) => addr.id === addressId);
    sessionStorage.setItem("selectedAddress", JSON.stringify(address));

    if (address) {
      setSelectedAddress(address);
      setSelectedAddressId(addressId);
      setShowAddressDetails(true);
      // Don't expand when selecting address
    } else {
      setShowAddressDetails(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedAddress(null);
    setShowAddressDetails(false);
    setSelectedAddressId("");
    setAddressExpanded(false);
  };

  const handleAddAddressClick = () => {
    setShowForm(!showForm);
    if (!showForm && userInfo) {
      setShippingInfo((prev) => ({
        ...prev,
        name: userInfo.firstName,
        email: userInfo.email || "",
        number: userInfo.phoneNumber || "",
      }));
    }
    setAddressExpanded(showForm ? false : true);
  };

  const cartTotal =
    checkoutMode === "buynow"
      ? buyNowItem
        ? buyNowItem.discountedPrice * buyNowItem.quantity
        : 0
      : itemsToDisplay.reduce(
          (total, item) => total + item.discountedPrice * item.quantity,
          0
        );

  const handlePayClick = async () => {
    if (!userId) {
      toast.error("Please log in to complete your purchase.");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    if (localItems.length === 0) {
      toast.error("Your cart is empty. Please add items before proceeding.");
      return;
    }

    try {
      const orderRef = collection(firestore, "users", userId, "orders");
      const itemsForOrder =
        checkoutMode === "buynow" ? [buyNowItem] : cartItems;
      const finalCartTotal =
        checkoutMode === "buynow"
          ? buyNowItem.discountedPrice * buyNowItem.quantity
          : cartTotal;

      const finalDiscountAmount = Math.round(discountAmount || 0);
      const finalTotalAmount = Math.round(finalCartTotal - finalDiscountAmount);

      const newOrder = {
        cartItems: itemsForOrder,
        shippingInfo: selectedAddress,
        totalAmount: finalTotalAmount,
        subTotal: finalCartTotal,
        orderCreatedAt: new Date(),
        userInfo: {
          email: userInfo?.email || "",
          phoneNumber: userInfo?.phoneNumber || "",
          firstName: userInfo?.firstName || "",
          lastName: userInfo?.lastName || "",
          userId: userId,
        },
        orderType: checkoutMode,
        discountAmount: finalDiscountAmount || 0,
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
      };

      await addDoc(orderRef, newOrder);

      if (checkoutMode === "buynow") {
        removeBuyNowItem();
      } else {
        clearCart();
      }

      toast.success("Redirecting to WhatsApp order...");
      setTimeout(() => {
        navigate("/Whatsapporder");
      }, 1500);
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error("Unable to process your order. Please try again later.");
    }
  };

  const handleToggleWishlist = async (item, e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!userId) {
      toast.error("Please sign in to manage your wishlist");
      return;
    }

    if (!wishlistContext) {
      toast.error("Wishlist functionality is not available");
      return;
    }

    if (isInWishlist(item.id, item.size)) {
      removeFromWishlist(item.id, item.size);
      toast.success("Removed from wishlist");
    } else {
      const wishlistItem = {
        id: item.id,
        Img: item.Img,
        Name: item.Name,
        Category: item.Category,
        discountedPrice: item.discountedPrice,
        price: item.price || item.discountedPrice,
        size: item.size,
        color: item.color || "",
        quantity: item.quantity || 1,
      };

      await addToWishlist(wishlistItem);

      // Remove from cart and update Firebase
      if (checkoutMode === "buynow") {
        removeBuyNowItem();
      } else {
        removeItem(item.id, item.size);
        // Update cart in Firebase
        const updatedCartItems = cartItems.filter(
          (cartItem) => cartItem.id !== item.id || cartItem.size !== item.size
        );
      }

      // Update local items
      setLocalItems((prevItems) =>
        prevItems.filter((i) => i.id !== item.id || i.size !== item.size)
      );

      toast.success("Added to wishlist");
    }
  };

  const handleAddToCart = async (item) => {
    // Remove from wishlist
    if (isInWishlist && removeFromWishlist) {
      await removeFromWishlist(item.id, item.size);
    }

    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error("Please sign in to add items to your cart");
      return;
    }

    try {
      // Create a unique identifier for the cart item
      const uniqueItemId = `${item.id}-${item.size}`;
      const cartDocRef = doc(db, "users", user.uid, "Cart", uniqueItemId);

      // Check if item already exists in cart
      const existingCartItem = await getDoc(cartDocRef);

      let cartItem;
      let isNewItem = !existingCartItem.exists();

      if (isNewItem) {
        // If item doesn't exist, create new item
        cartItem = {
          ...item,
          quantity: 1,
        };
      } else {
        // If item exists, increase quantity
        cartItem = existingCartItem.data();
        cartItem.quantity = (cartItem.quantity || 0) + 1;
      }

      // Update Firebase
      await setDoc(cartDocRef, cartItem);

      // IMPORTANT: Instead of using the dispatch method directly,
      // let's fetch the updated cart from Firebase to ensure consistency
      const cartCollection = collection(db, "users", user.uid, "Cart");
      const cartSnapshot = await getDocs(cartCollection);
      const updatedCartItems = cartSnapshot.docs.map((doc) => doc.data());

      // Update the global cart state with the fetched data
      dispatch({ type: "SET_CART", payload: updatedCartItems });

      // Update local items for UI
      setLocalItems(updatedCartItems);

      toast.success(isNewItem ? "Added to cart" : "Item quantity increased");

      // If in buynow mode, we need to update the checkout mode
      if (checkoutMode === "buynow") {
        setCheckoutMode("cart");
        navigate("/checkout", { replace: true });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };
  // const isItemInFavorites = (item) => {
  //   if (!localFavorites || !Array.isArray(localFavorites)) {
  //     return false;
  //   }

  //   // Add debugging to see what's happening
  //   console.log("Checking if item is in favorites:", item.id, item.size);
  //   console.log("Current favorites:", localFavorites);

  //   return localFavorites.some(
  //     (fav) => fav.id === item.id && fav.size === item.size
  //   );
  // };

  const handleNext = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address before proceeding.");
      return;
    }
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleIncrement = (item) => {
    if (checkoutMode === "buynow") {
      incrementBuyNowItem();
    } else {
      incrementItem(item.id, item.size);
    }
  };

  const handleDecrement = (item) => {
    if (checkoutMode === "buynow") {
      decrementBuyNowItem();
    } else {
      decrementItem(item.id, item.size);
    }
  };

  const handleRemove = (item) => {
    if (checkoutMode === "buynow") {
      removeBuyNowItem();
      // Check if cart has items to fall back to
      if (cartItems.length > 0) {
        setCheckoutMode("cart");
        setLocalItems(cartItems);
        navigate("/checkout", { replace: true });
      }
    } else {
      removeItem(item.id, item.size);
      // Update local items immediately to reflect cart state
      setLocalItems(
        cartItems.filter((i) => i.id !== item.id || i.size !== item.size)
      );
    }
  };

  const calculateDiscount = (items, coupon) => {
    if (!coupon) return 0;

    const validItems = Array.isArray(items)
      ? items.filter((item) => item != null)
      : [];

    const itemCount = validItems.reduce(
      (count, item) => count + (item.quantity || 0),
      0
    );

    const totalAmount = validItems.reduce(
      (sum, item) => sum + (item.discountedPrice || 0) * (item.quantity || 0),
      0
    );

    if (itemCount >= coupon.minItems) {
      if (coupon.discountType === "percenFaTage") {
        return Math.round(totalAmount * (coupon.value / 100));
      } else if (coupon.discountType === "itemFree" && itemCount >= 5) {
        if (validItems.length > 0) {
          const sortedItems = [...validItems].sort(
            (a, b) => (a.discountedPrice || 0) - (b.discountedPrice || 0)
          );
          return Math.round(sortedItems[0].discountedPrice || 0);
        }
      }
    }
    return 0;
  };

  const handleApplyCoupon = () => {
    if (!localCouponCode) return;

    const itemsToCheck =
      checkoutMode === "buynow" ? [buyNowItem] : itemsToDisplay;
    const itemCount = itemsToCheck.reduce(
      (count, item) => count + item.quantity,
      0
    );

    const coupon = availableCoupons.find((c) => c.code === localCouponCode);

    if (!coupon) {
      toast.error("Invalid coupon code");
      return;
    }

    if (itemCount < coupon.minItems) {
      toast.error(`Need at least ${coupon.minItems} items for this coupon`);
      return;
    }

    setAppliedCoupon(coupon);
    const discount = calculateDiscount(itemsToCheck, coupon);
    setDiscountAmount(discount);
    setCouponMessage(`Coupon applied: ${coupon.description}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setLocalCouponCode("");
    setCouponMessage("");
  };

  useEffect(() => {
    if (appliedCoupon) {
      const itemsToCheck =
        checkoutMode === "buynow" ? [buyNowItem] : itemsToDisplay;
      const discount = calculateDiscount(itemsToCheck, appliedCoupon);
      setDiscountAmount(discount);
    }
  }, [itemsToDisplay, buyNowItem, checkoutMode, appliedCoupon]);

  return (
    <>
      <Toaster position="top-center" />
      <div className="checkout">
        <div className="progress-bar-container">
          <div className="progress-bar">
            {steps.map((step, index) => (
              <div
                key={step}
                className="step"
                onClick={() => setCurrentStep(index + 1)}
              >
                <div
                  className={`step-circle ${
                    currentStep > index + 1
                      ? "completed"
                      : currentStep === index + 1
                      ? "active"
                      : ""
                  }`}
                >
                  {index + 1}
                </div>
                <div className="step-label">{step}</div>
              </div>
            ))}
            <div
              className="progress"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 88}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="checkout-tabs">
          <button
            className={`checkout-tab ${activeTab === "cart" ? "active" : ""}`}
            onClick={() => setActiveTab("cart")}
          >
            <FaShoppingCart size={18} />
            Cart ({itemsToDisplay.length})
          </button>
          <button
            className={`checkout-tab ${
              activeTab === "wishlist" ? "active" : ""
            }`}
            onClick={() => setActiveTab("wishlist")}
          >
            <FaHeart size={18} />
            Wishlist ({wishlistItems.length})
          </button>
        </div>

        <div className="checkout-container">
          {currentStep === 1 ? (
            <motion.div
              className="checkout-content"
              animate={addressExpanded ? "expanded" : "collapsed"}
              initial={false}
            >
              {activeTab === "cart" ? (
                <motion.div
                  className="cart-section"
                  animate={addressExpanded ? "expanded" : "collapsed"}
                >
                  <h2>Shopping Cart</h2>
                  {itemsToDisplay.length > 0 ? (
                    itemsToDisplay.map((item, index) => (
                      <motion.div
                        className="cart-item"
                        key={`${item.id}-${item.size}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="cart-item-content">
                          <div className="cart-item-left">
                            <figure className="cart-item-img">
                              <LazyImage
                                src={item.Img || "/placeholder.svg"}
                                alt={item.Name}
                              />
                              {item.discountedPrice < item.price && (
                                <div className="discount-badge">
                                  <FaTag size={12} />
                                  {Math.round(
                                    (1 - item.discountedPrice / item.price) *
                                      100
                                  )}
                                  % OFF
                                </div>
                              )}
                            </figure>
                          </div>
                          <div className="cart-item-info">
                            <div className="cart-item-header">
                              <h2>{item.Name}</h2>
                              <button
                                className="wishlist-button"
                                aria-label="Toggle wishlist"
                                onClick={(e) => handleToggleWishlist(item, e)}
                              >
                                <FaHeart
                                  size={18}
                                  fill={
                                    isInWishlist &&
                                    isInWishlist(item.id, item.size)
                                      ? "#111"
                                      : "none"
                                  }
                                  color={
                                    isInWishlist &&
                                    isInWishlist(item.id, item.size)
                                      ? "#113"
                                      : "#000"
                                  }
                                />
                              </button>
                            </div>

                            <div className="item-details">
                              <div className="item-meta">
                                <span className="item-size">
                                  Size: {item.size}
                                </span>
                                {item.color && (
                                  <span className="item-color">
                                    Color: {item.color}
                                  </span>
                                )}
                              </div>
                              <div className="price-FaTag">
                                <h4>
                                  ₹
                                  {(
                                    item.discountedPrice * item.quantity
                                  ).toLocaleString()}{" "}
                                  ||
                                  <span style={{ color: "#4e4e4e" }}>
                                    {" "}
                                    ₹{item.discountedPrice.toLocaleString()}
                                  </span>
                                </h4>
                              </div>
                            </div>

                            <div className="cart-item-actions">
                              <div className="quantity-controls">
                                <button
                                  onClick={() => handleDecrement(item)}
                                  disabled={item.quantity <= 1}
                                  className="quantity-btn"
                                >
                                  <FaMinus size={16} />
                                </button>
                                <span className="quantity-display">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleIncrement(item)}
                                  className="quantity-btn"
                                >
                                  <FaPlus size={16} />
                                </button>
                              </div>
                              <button
                                className="remove-item-button"
                                onClick={() => handleRemove(item)}
                                aria-label="Remove item"
                              >
                                <FaTrash size={18} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="empty-cart-message">
                      <div className="empty-cart-msg">
                        <FaShoppingCart size={50} />
                        <h3>Your cart is empty</h3>
                      </div>
                      <Link to="/Home" className="continue-shopping-btn">
                        Continue Shopping
                      </Link>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="wishlist-section"
                  animate={addressExpanded ? "expanded" : "collapsed"}
                >
                  <h2>Wishlist Items</h2>
                  {wishlistItems.length > 0 ? (
                    wishlistItems.map((item, index) => (
                      <motion.div
                        className="wishlist-item"
                        key={`${item.id}-${item.size}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="wishlist-item-content">
                          <div className="wishlist-item-left">
                            <figure className="wishlist-item-img">
                              <LazyImage
                                src={item.Img || "/placeholder.svg"}
                                alt={item.Name}
                              />

                              {item.price &&
                                item.discountedPrice < item.price && (
                                  <div className="discount-badge">
                                    <FaTag size={12} />
                                    {Math.round(
                                      (1 - item.discountedPrice / item.price) *
                                        100
                                    )}
                                    % OFF
                                  </div>
                                )}
                            </figure>
                          </div>
                          <div className="wishlist-item-info">
                            <div className="wishlist-item-header">
                              <h2>{item.Name}</h2>
                            </div>

                            <div className="item-details">
                              <div className="item-meta">
                                <span className="item-quantity">
                                  Quantity: {item.quantity}
                                </span>
                                <span className="item-size">
                                  Size: {item.size ? item.size : "N/A"}
                                </span>
                                {item.color && (
                                  <span className="item-color">
                                    Color: {item.color}
                                  </span>
                                )}
                              </div>
                              <div className="price-tag">
                                <h4>
                                  ₹{item.discountedPrice.toLocaleString()}
                                  {item.price &&
                                    item.price > item.discountedPrice && (
                                      <span className="original-price">
                                        {" "}
                                        ₹{item.price.toLocaleString()}
                                      </span>
                                    )}
                                </h4>
                              </div>
                            </div>

                            <div className="wishlist-item-actions">
                              <button
                                className="add-to-cart-button"
                                onClick={() => handleAddToCart(item)}
                              >
                                <FaShoppingCart size={16} />
                                <span>Add to Cart</span>
                              </button>
                              <button
                                className="remove-item-button"
                                onClick={() =>
                                  removeFromWishlist(item.id, item.size)
                                }
                              >
                                <FaTrash size={16} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="empty-wishlist-message">
                      <div className="empty-wishlist-msg">
                        <FaHeart size={50} />
                        <h3>Your wishlist is empty</h3>
                        <p>Save items for later by clicking the heart icon</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div
                className="address-section"
                animate={addressExpanded ? "expanded" : "collapsed"}
              >
                <h2>Delivery Address</h2>
                <button
                  className="add-address-button"
                  onClick={handleAddAddressClick}
                >
                  {showForm ? "Cancel" : "Add New Address"}
                </button>

                <AnimatePresence>
                  {showForm && (
                    <motion.form
                      className="address-form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="form-grid">
                        <input
                          type="text"
                          name="name"
                          value={shippingInfo.name}
                          onChange={handleInputChange}
                          placeholder="Full Name"
                          required
                        />
                        <input
                          type="email"
                          name="email"
                          value={shippingInfo.email}
                          onChange={handleInputChange}
                          placeholder="Email Address"
                          required
                        />
                        <input
                          type="tel"
                          name="number"
                          value={shippingInfo.number}
                          onChange={handleInputChange}
                          placeholder="Phone Number"
                          required
                        />
                        <input
                          type="text"
                          name="flat"
                          value={shippingInfo.flat}
                          onChange={handleInputChange}
                          placeholder="Flat No / Building Name"
                          required
                        />
                        <input
                          type="text"
                          name="street"
                          value={shippingInfo.street}
                          onChange={handleInputChange}
                          placeholder="Street Name"
                          required
                        />
                        <input
                          type="text"
                          name="locality"
                          value={shippingInfo.locality}
                          onChange={handleInputChange}
                          placeholder="Locality"
                          required
                        />
                        <input
                          type="text"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          required
                        />
                        <input
                          type="text"
                          name="pinCode"
                          value={shippingInfo.pinCode}
                          onChange={handleInputChange}
                          placeholder="PIN Code"
                          required
                        />
                        <select
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select State</option>
                          <option value="AN">
                            Andaman and Nicobar Islands
                          </option>
                          <option value="AP">Andhra Pradesh</option>
                          <option value="AR">Arunachal Pradesh</option>
                          <option value="AS">Assam</option>
                          <option value="BR">Bihar</option>
                          <option value="CH">Chandigarh</option>
                          <option value="CT">Chhattisgarh</option>
                          <option value="DN">Dadra and Nagar Haveli</option>
                          <option value="DD">Daman and Diu</option>
                          <option value="DL">Delhi</option>
                          <option value="GA">Goa</option>
                          <option value="GJ">Gujarat</option>
                          <option value="HR">Haryana</option>
                          <option value="HP">Himachal Pradesh</option>
                          <option value="JK">Jammu and Kashmir</option>
                          <option value="JH">Jharkhand</option>
                          <option value="KA">Karnataka</option>
                          <option value="KL">Kerala</option>
                          <option value="LA">Ladakh</option>
                          <option value="LD">Lakshadweep</option>
                          <option value="MP">Madhya Pradesh</option>
                          <option value="MH">Maharashtra</option>
                          <option value="MN">Manipur</option>
                          <option value="ML">Meghalaya</option>
                          <option value="MZ">Mizoram</option>
                          <option value="NL">Nagaland</option>
                          <option value="OR">Odisha</option>
                          <option value="PY">Puducherry</option>
                          <option value="PB">Punjab</option>
                          <option value="RJ">Rajasthan</option>
                          <option value="SK">Sikkim</option>
                          <option value="TN">Tamil Nadu</option>
                          <option value="TG">Telangana</option>
                          <option value="TR">Tripura</option>
                          <option value="UP">Uttar Pradesh</option>
                          <option value="UT">Uttarakhand</option>
                          <option value="WB">West Bengal</option>
                        </select>
                      </div>
                      <button type="submit">Save Address</button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="address-selection">
                  <h3>Saved Addresses</h3>
                  <div className="address-options">
                    {savedAddresses.map((address) => (
                      <motion.div
                        key={address.id}
                        className={`address-option ${
                          selectedAddressId === address.id ? "selected" : ""
                        }`}
                        onClick={() => handleAddressSelection(address.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="address-radio">
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={() => {}}
                          />
                          {selectedAddressId === address.id && (
                            <div className="address-check">
                              <FaCheck size={14} />
                            </div>
                          )}
                        </div>
                        <div className="address-details">
                          <strong>{address.name}</strong>
                          <p>{address.number}</p>
                          <p>
                            {address.flat}, {address.street}, {address.locality}
                          </p>
                          <p>
                            {address.city}, {address.state} - {address.pinCode}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="checkout-content">
              <div className="cart-section">
                <h2>Order Summary</h2>
                {itemsToDisplay.map((item, index) => (
                  <motion.div
                    className="cart-item"
                    key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="cart-item-content">
                      <div className="cart-item-left">
                        <figure className="cart-item-img">
                          <LazyImage
                            src={item.Img || "/placeholder.svg"}
                            alt={item.Name}
                          />
                        </figure>
                      </div>
                      <div className="cart-item-info">
                        <h2>{item.Name}</h2>
                        <div className="item-details">
                          <div className="item-meta">
                            <span className="item-size">Size: {item.size}</span>
                            <span className="item-quantity">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          <div className="price-FaTag">
                            <span className="total-price">
                              ₹
                              {(
                                item.discountedPrice * item.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {selectedAddress && (
                  <div className="selected-address-summary">
                    <h3>Delivery Address</h3>
                    <p>{selectedAddress.name}</p>
                    <p>{selectedAddress.number}</p>
                    <p>
                      {selectedAddress.flat}, {selectedAddress.street},{" "}
                      {selectedAddress.locality}
                      {selectedAddress.street}, {selectedAddress.locality}
                    </p>
                    <p>
                      {selectedAddress.city}, {selectedAddress.state} -{" "}
                      {selectedAddress.pinCode}
                    </p>
                  </div>
                )}
              </div>

              <div className="payment-section">
                <h2>Payment Details</h2>
                <div className="coupon-section">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={localCouponCode}
                    onChange={(e) =>
                      setLocalCouponCode(e.target.value.toUpperCase())
                    }
                  />
                  <button
                    className="apply-coupon-btn"
                    onClick={
                      appliedCoupon ? handleRemoveCoupon : handleApplyCoupon
                    }
                  >
                    {appliedCoupon ? "Remove" : "Apply"}
                  </button>
                </div>
                {couponMessage && (
                  <div className="coupon-message-text">{couponMessage}</div>
                )}
                <button
                  className="view-coupons-button"
                  onClick={() => setShowCouponDialog(true)}
                >
                  View Available Coupons
                </button>

                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Discount</span>
                    <span>
                      {discountAmount > 0
                        ? `₹${Math.round(discountAmount).toLocaleString()}`
                        : "₹0"}
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>
                      ₹{Math.round(cartTotal - discountAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="button-group">
            {currentStep > 1 && (
              <button onClick={handlePrev} className="checkout-btn prev">
                Previous
              </button>
            )}
            {currentStep < 2 ? (
              <button className="checkout-btn next" onClick={handleNext}>
                Next
              </button>
            ) : (
              <motion.button
                className="pay-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePayClick}
              >
                Place Order
              </motion.button>
            )}
          </div>
        </div>
        {showCouponDialog && (
          <div className="coupon-dialog-overlay">
            <div className="coupon-dialog">
              <div className="coupon-dialog-header">
                <h3>Available Coupons</h3>
                <button onClick={() => setShowCouponDialog(false)}>×</button>
              </div>
              <div className="coupon-list">
                {availableCoupons.map((coupon) => (
                  <div key={coupon.code} className="coupon-item">
                    <div className="coupon-item-left">
                      <div className="coupon-code">{coupon.code}</div>
                      <div className="coupon-description">
                        {coupon.description}
                      </div>
                      <div className="coupon-requirement">
                        Minimum {coupon.minItems} items required
                      </div>
                    </div>
                    <button
                      className="dialog-coupon-apply"
                      onClick={() => {
                        setLocalCouponCode(coupon.code);
                        handleApplyCoupon();
                        setShowCouponDialog(false);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Checkoutnew;
