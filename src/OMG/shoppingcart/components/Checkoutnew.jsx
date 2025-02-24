import React, { useContext, useState, useEffect } from "react";
import cartContext from "../context/cartContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlus, FaMinus, FaTruck, FaTrash } from "react-icons/fa";
import { firestore, db } from "../../db/Firebase";
import { collection, doc, getDocs, getDoc, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import "./Checkoutnew.css";

const Checkoutnew = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ["Overview", "Address", "Payment"];
  const { cartItems, removeItem, buyNowItem } = useContext(cartContext);
  const [userId, setUserId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [buyNowItem1, setBuyNowItem] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const {
    incrementItem,
    decrementItem,
    incrementBuyNowItem,
    decrementBuyNowItem,
    removeBuyNowItem,
    clearCart,
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

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
        } else {
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
        // Fetch user document using query
        try {
          const usersRef = collection(db, "users");
          const querySnapshot = await getDocs(usersRef);

          // Find the document that matches the uid
          const userDoc = querySnapshot.docs.find(
            (doc) => doc.data().uid === user.uid
          );

          if (userDoc) {
            const userData = userDoc.data();
            // Store the document ID for future use
            setUserId(userDoc.id);
            setUserInfo(userData);

            // Pre-fill shipping info with user data
            setShippingInfo((prevState) => ({
              ...prevState,
              name: userData.firstName,
              email: userData.email || "",
              number: userData.phoneNumber || "",
              // Keep existing address fields if they exist
              flat: prevState.flat || "",
              street: prevState.street || "",
              locality: prevState.locality || "",
              city: prevState.city || "",
              pinCode: prevState.pinCode || "",
              state: prevState.state || "",
            }));
          } else {
          }
        } catch (error) {
          toast.error("Failed to load user information");
        }
      } else {
        setUserId(null);
        setUserInfo(null);
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update the address fetching logic to use sanitizedId
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

  useEffect(() => {
    // Determine initial mode and items based on URL and available items
    if (mode === "mode=buynow" && buyNowItem) {
      setLocalItems([buyNowItem]);
      setCheckoutMode("buynow");
    } else if (cartItems.length > 0) {
      setLocalItems(cartItems);
      setCheckoutMode("cart");
    }
  }, [mode, buyNowItem, cartItems]);

  // Modified effect for handling item removal
  useEffect(() => {
    const handleModeChange = () => {
      if (checkoutMode === "buynow") {
        if (!buyNowItem) {
          // If buy now item is removed and cart has items, switch to cart
          if (cartItems.length > 0) {
            setCheckoutMode("cart");
            setLocalItems(cartItems);
            navigate("/checkout", { replace: true });
          } else {
            // If no items left at all, redirect to home or cart
            navigate("/cart");
          }
        }
      } else if (checkoutMode === "cart") {
        if (cartItems.length === 0) {
          if (buyNowItem) {
            // If cart is empty but there's a buy now item, switch to it
            setCheckoutMode("buynow");
            setLocalItems([buyNowItem]);
            navigate("/checkout/mode=buynow", { replace: true });
          } else {
            // If no items left at all, redirect to home or cart
            navigate("/cart");
          }
        }
      }
    };

    handleModeChange();
  }, [buyNowItem, cartItems, checkoutMode, navigate]);

  const itemsToDisplay = localItems;

  const handleInputChange = (e) => {
    setShippingInfo((prev) => {
      const updated = { ...prev, [e.target.name]: e.target.value };
      return updated;
    });
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
      } catch (error) {
        toast.error("Error saving order data:", error);
      }
    } else {
      toast.error("Please login to save shipping information.");
    }
  };
  const handleAddressSelection = (addressId) => {
    const address = savedAddresses.find((addr) => addr.id === addressId);
    if (address) {
      setSelectedAddress(address);
      setSelectedAddressId(addressId);
      setShowAddressDetails(true);
    } else {
      setShowAddressDetails(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedAddress(null);
    setShowAddressDetails(false);
    setSelectedAddressId("");
  };

  const handleAddAddressClick = () => {
    setShowForm(!showForm);

    // Only update if we're showing the form and have userInfo
    if (!showForm && userInfo) {
      const fullName = userInfo.firstName;
      const email = userInfo.email || "";
      const phoneNumber = userInfo.phoneNumber || "";

      setShippingInfo((prev) => ({
        ...prev,
        name: fullName,
        number: phoneNumber,
        email: email,
      }));
    }
  };
  // if (itemsToDisplay.length === 0) {
  //   // Instead of showing empty checkout page
  //   navigate("/Home"); // or navigate to order confirmation
  // }
  const cartTotal =
    checkoutMode === "buynow"
      ? buyNowItem
        ? buyNowItem.price * buyNowItem.quantity
        : 0
      : itemsToDisplay.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

  // Save the order details to Firestore and navigate to payment page
  const handlePayClick = async () => {
    if (userId && selectedAddress && localItems.length > 0) {
      try {
        const orderRef = collection(firestore, "users", userId, "orders");
        const itemsForOrder =
          checkoutMode === "buynow" ? [buyNowItem] : cartItems;

        const newOrder = {
          cartItems: itemsForOrder,
          shippingInfo: selectedAddress,
          totalAmount:
            checkoutMode === "buynow"
              ? buyNowItem.price * buyNowItem.quantity
              : cartTotal,
          orderCreatedAt: new Date(),
          userInfo: {
            email: userInfo.email,
            phoneNumber: userInfo.phoneNumber,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            userId: userId,
          },
          orderType: checkoutMode,
        };

        await addDoc(orderRef, newOrder);

        // const confirmPurchase = window.confirm(
        //   `Proceed to pay for ${
        //     checkoutMode === "buynow" ? "this item" : "cart items"
        //   }?`
        // );
        // if (!confirmPurchase) return;

        if (checkoutMode === "buynow") {
          removeBuyNowItem();
        } else {
          clearCart();
        }
        toast.success(
          `Order placed successfully! ${
            checkoutMode === "buynow"
              ? "You can continue shopping or check your cart items."
              : "You can continue shopping."
          }`
        );
        navigate("/Whatsapporder");
      } catch (error) {
        toast.error("Error creating order");
      }
    } else {
      alert("Please select an address and ensure the cart is not empty.");
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
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

  return (
    <>
      <Toaster position="top-center" />
      <div className="checkout">
        <div className="checkout-container">
          <div className="progress-bar-container">
            <div className="progress-bar">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`step ${
                    currentStep > index + 1 ? "completed" : ""
                  } ${currentStep === index + 1 ? "active" : ""}`}
                  onClick={() => setCurrentStep(index + 1)}
                >
                  <div className="step-circle">{index + 1}</div>
                  <div className="step-label">{step}</div>
                </div>
              ))}
              <div
                className="progress"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="form-container">
            {currentStep === 1 && (
              <div className="form-step enter">
                <div className="cart-view">
                  {itemsToDisplay.map((item, index) => (
                    <motion.div
                      className="cart-item"
                      key={`${checkoutMode}-${item.id}-${item.size}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <figure className="cart-item-img">
                        <img src={item.Img} alt={item.Name} />
                      </figure>
                      <div className="cart-item-info">
                        <h2>{item.Name}</h2>
                        <h4>
                          ₹{(item.price * item.quantity).toLocaleString()} {""}
                          ||
                          <span style={{ color: "#4e4e4e" }}>
                            {" "}
                            ₹ {item.price.toLocaleString()}{" "}
                          </span>
                        </h4>
                        <h4>Size : {item.size}</h4>
                        <div className="cart-item-pricing">
                          <div className="quantity-controls">
                            <button
                              onClick={() => handleDecrement(item)}
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => handleIncrement(item)}>
                              <FaPlus />
                            </button>
                          </div>
                          <button
                            className="remove-item-button"
                            onClick={() => handleRemove(item)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-step enter">
                <div className="address-overview">
                  <button
                    className="add-address-button"
                    onClick={handleAddAddressClick}
                  >
                    {showForm ? "Cancel" : "Add Address"}
                  </button>
                  {/* Address Form */}
                  {showForm && (
                    <form onSubmit={handleSubmit}>
                      <input
                        type="text"
                        name="name"
                        value={shippingInfo.name}
                        onChange={handleInputChange}
                        placeholder="Name"
                        required
                      />
                      <input
                        type="text"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        required
                      />
                      <input
                        type="text"
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
                        placeholder="Street"
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
                        placeholder="Pin Code"
                        required
                      />
                      <select
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select state</option>
                        <option value="AN">Andaman and Nicobar Islands</option>
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
                      <button type="submit">Save Shipping Information</button>
                    </form>
                  )}
                  {/* Saved Addresses Dropdown */}
                  <div className="address-selection">
                    <label>Select Address:</label>

                    {savedAddresses.map((address, index) => (
                      <div key={index} className="address-option">
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => handleAddressSelection(address.id)}
                        />
                        {address.name}, {address.number},{address.flat}.........
                      </div>
                    ))}
                    {showAddressDetails && (
                      <div className="address-details-form">
                        <div>
                          <strong>Name:</strong> {selectedAddress.name},{" "}
                          <strong>Number:</strong> {selectedAddress.number}
                        </div>
                        <div>
                          <strong>Email:</strong> {selectedAddress.email}
                        </div>
                        <div>
                          <strong>Flat No:</strong> {selectedAddress.flat},
                          <strong>Street Name:</strong> {selectedAddress.street}
                          , <strong>Locality:</strong>{" "}
                          {selectedAddress.locality}
                        </div>
                        <div>
                          <strong>City:</strong> {selectedAddress.city},
                          <strong>State:</strong> {selectedAddress.state}
                        </div>
                        <div>
                          <strong>Pin Code:</strong> {selectedAddress.pinCode}
                        </div>
                      </div>
                    )}
                    {selectedAddressId && (
                      <button
                        onClick={handleCancelSelection}
                        className="selection-cancel"
                      >
                        Cancel Selection
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="form-step enter">
                <div className="pay-overview">
                  <div className="checkout-left">
                    <div className="cart-view-final">
                      {itemsToDisplay.map((item, index) => (
                        <motion.div
                          className="cart-item"
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <figure className="cart-item-img">
                            <img src={item.Img} alt={item.Name} />
                          </figure>
                          <div className="cart-item-info">
                            <h2>{item.Name}</h2>
                            <h4>
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </h4>
                            <h4>Size : {item.size}</h4>
                            <div className="cart-item-pricing">
                              <div className="quantity-controls">
                                <button
                                  onClick={() => handleDecrement(item)}
                                  disabled={item.quantity <= 1}
                                >
                                  <FaMinus />
                                </button>
                                <span>{item.quantity}</span>
                                <button onClick={() => handleIncrement(item)}>
                                  <FaPlus />
                                </button>
                              </div>
                              <button
                                className="remove-item-button"
                                onClick={() => handleRemove(item)}
                              >
                                <FaTrash />{" "}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {selectedAddress ? (
                      <div className="address-details-form">
                        <p>{selectedAddress.name},</p>
                        <p>
                          {selectedAddress.flat}, {selectedAddress.street}
                        </p>
                        <p>{selectedAddress.locality},</p>
                        <p>
                          {selectedAddress.city}, {selectedAddress.state} -{" "}
                          {selectedAddress.pinCode},
                        </p>
                        <p>Phone: {selectedAddress.number}</p>
                      </div>
                    ) : (
                      <p>No address selected.</p>
                    )}
                  </div>
                  <div className="checkout-right">
                    <div className="coupon-section">
                      <input type="text" placeholder="Coupon Code" />
                      <button className="apply-button">Apply</button>
                    </div>
                    <div className="summary-details">
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹ {cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="summary-row">
                        <span>Discount</span>
                        <span>Free</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total</span>
                        <span>₹ {cartTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="button-group">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`checkout-btn prev ${
                currentStep === 1 ? "disabled" : ""
              }`}
            >
              Previous
            </button>
            {currentStep < 3 ? (
              <button className="checkout-btn next" onClick={handleNext}>
                Next
              </button>
            ) : (
              <Link to={"/Whatsapporder"}>
                <motion.button
                  className="pay-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePayClick}
                >
                  Pay
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkoutnew;
