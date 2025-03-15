import React, { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart, FiCreditCard, FiPackage } from "react-icons/fi";
import { FaPlus, FaMinus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { collection, doc, getDocs, getDoc, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firestore, db } from "../../db/Firebase";
import cartContext from "../context/cartContext";
import "./Checkout.css";
import LazyImage from "../../admin/Components/LazyLoad";

const PremiumCheckout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null); // Added state for address ID
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    number: "",
    flat: "",
    street: "",
    locality: "",
    city: "",
    pinCode: "",
    state: "",
  });
  const [testInputValue, setTestInputValue] = useState("");

  const [coupon, setCoupon] = useState("");
  const navigate = useNavigate();
  const { cartItems, updateCartItem } = useContext(cartContext);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserInfo();
      fetchAddresses();
    }
  }, [userId]);

  const fetchUserInfo = async () => {
    try {
      const userRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserInfo(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

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
      console.error("Error fetching addresses:", error);
    }
  };
  const renderTestInput = () => (
    <div>
      <h1>Test Input</h1>
      <input
        type="text"
        value={testInputValue}
        onChange={(e) => {
          console.log("Changing:", e.target.value);
          setTestInputValue(e.target.value);
        }}
        onTouchStart={() => console.log("Touch start")}
        onTouchMove={() => console.log("Touch move")}
        onTouchEnd={() => console.log("Touch end")}
        placeholder="Type here"
      />
      <p>Current value: {testInputValue}</p>
    </div>
  );
  const handleQuantityChange = (item, newQuantity) => {
    updateCartItem(item.id, newQuantity);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (userId) {
      const userOrderRef = collection(
        firestore,
        "users",
        userId,
        "ShippingInfo"
      );
      try {
        await addDoc(userOrderRef, shippingInfo);
        alert("Shipping information saved successfully.");
        setShowAddressForm(false);
        fetchAddresses();
        setShippingInfo({
          name: "",
          number: "",
          flat: "",
          street: "",
          locality: "",
          city: "",
          pinCode: "",
          state: "",
        });
      } catch (error) {
        console.error("Error saving order data:", error);
      }
    }
  };

  const handlePayClick = async () => {
    if (userId && selectedAddress && cartItems.length > 0) {
      try {
        const orderRef = collection(firestore, "users", userId, "orders");
        const newOrder = {
          cartItems,
          shippingInfo: selectedAddress,
          totalAmount: cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          orderCreatedAt: new Date(),
          userInfo: {
            email: userInfo.email,
            phoneNumber: userInfo.phoneNumber,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            userId: userId,
          },
        };
        await addDoc(orderRef, newOrder);
        navigate("/Payment");
      } catch (error) {
        console.error("Error saving order:", error);
      }
    } else {
      alert("Please select an address and ensure the cart is not empty.");
    }
  };

  const CartSection = () => (
    <div className="cart-section">
      <h2>Your Cart</h2>
      {cartItems.map((item) => (
        <div className="cart-item" key={item.id}>
          <LazyImage src={item.Img} alt={item.Name} className="cart-item-img" />
          <div className="cart-item-info">
            <h3>{item.Name}</h3>
            <p>Category: {item.Category}</p>
            <p>Size: {item.size}</p>
            <p>₹ {item.price.toLocaleString()}</p>
            <div className="quantity-controls">
              <button
                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                +
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item, item.quantity + 1)}
              >
                -
              </button>
            </div>
          </div>
          <p className="cart-item-total">
            ₹ {(item.price * item.quantity).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );

  const AddressSection = React.memo(() => (
    <div className="address-section">
      <h2>Shipping Address</h2>
      {savedAddresses.map((address) => (
        <div
          key={address.id}
          className={`address-item ${
            selectedAddress?.id === address.id ? "selected" : ""
          }`}
          onClick={() => setSelectedAddress(address)}
        >
          <p>{address.name}</p>
          <p>{address.street}</p>
          <p>{`${address.city}, ${address.state} ${address.pinCode}`}</p>
        </div>
      ))}
      <button onClick={() => setShowAddressForm(!showAddressForm)}>
        {showAddressForm ? "Cancel" : "Add New Address"}
      </button>
      {showAddressForm && (
        <form
          className="address-form"
          onSubmit={handleAddressSubmit}
          autoComplete="off"
        >
          <input
            type="text"
            name="name"
            value={shippingInfo.name}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, name: e.target.value })
            }
            placeholder="Name"
            required
          />
          <input
            type="text"
            name="number"
            value={shippingInfo.number}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, number: e.target.value })
            }
            placeholder="Phone Number"
            required
          />
          <input
            type="text"
            name="flat"
            value={shippingInfo.flat}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, flat: e.target.value })
            }
            placeholder="Flat No / Building Name"
            required
          />
          <input
            type="text"
            name="street"
            value={shippingInfo.street}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, street: e.target.value })
            }
            placeholder="Street"
            required
          />
          <input
            type="text"
            name="locality"
            value={shippingInfo.locality}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, locality: e.target.value })
            }
            placeholder="Locality"
            required
          />
          <input
            type="text"
            name="city"
            value={shippingInfo.city}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, city: e.target.value })
            }
            placeholder="City"
            required
          />
          <input
            type="text"
            name="pinCode"
            value={shippingInfo.pinCode}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, pinCode: e.target.value })
            }
            placeholder="Pin Code"
            required
          />
          <select
            name="state"
            value={shippingInfo.state}
            onChange={(e) =>
              setShippingInfo({ ...shippingInfo, state: e.target.value })
            }
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
          <button type="submit">Save Address</button>
        </form>
      )}
    </div>
  ));

  const PaymentSection = () => {
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return (
      <div className="payment-section">
        <h2>Payment</h2>
        <div className="coupon-section">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter coupon code"
          />
          <button onClick={() => alert("Coupon applied!")}>Apply</button>
        </div>
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
        </div>
        <motion.button
          className="pay-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayClick}
        >
          Pay Now
        </motion.button>
      </div>
    );
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-steps">
          {[1, 2, 3].map((step) => (
            <div key={step} className="step-item">
              <motion.div
                className={`step-circle ${step <= currentStep ? "active" : ""}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {step === 1 && <FiShoppingCart />}
                {step === 2 && <FiPackage />}
                {step === 3 && <FiCreditCard />}
              </motion.div>
              {step < 3 && (
                <div
                  className={`step-line ${step < currentStep ? "active" : ""}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="checkout-content">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="cart"
              className="main-section"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CartSection />
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div
              key="address"
              className="side-section"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3 }}
            >
              <AddressSection />
              {renderTestInput()}
            </motion.div>
          )}
          {currentStep === 3 && (
            <motion.div
              key="payment"
              className="side-section"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3 }}
            >
              <PaymentSection />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="navigation-buttons">
          {currentStep > 1 && (
            <motion.button
              className="nav-btn prev"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </motion.button>
          )}
          {currentStep < 3 && (
            <motion.button
              className="nav-btn next"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumCheckout;
