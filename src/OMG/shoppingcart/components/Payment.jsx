import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { firebaseApp } from "../../db/Firebase";
import "./Payment.css";
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error state

  const fetchOrders = async (uid) => {
    try {
      const ordersCollection = collection(db, "users", uid, "orders");
      const ordersSnapshot = await getDocs(ordersCollection);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(), // Spread all fields like `total`, `cartItems`, `orderCreatedAt`
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again later."); // Set error message
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchOrders(currentUser.uid);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchOrders(currentUser.uid);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);
  const mostRecentOrder =
    orders.length > 0
      ? orders.sort(
          (a, b) => b.orderCreatedAt.seconds - a.orderCreatedAt.seconds
        )[0]
      : null;

  return (
    <div className="order-confirmation-container">
      <h1 className="thank-you-header">Thank You for Your Order!</h1>
      <p className="order-status-message">
        Your order has been placed successfully.
      </p>

      <div className="order-summary">
        <h2 className="orders-heading">Order Details</h2>
        <div className="orders-content">
          {loading ? (
            <div className="loading-indicator">Loading...</div>
          ) : error ? (
            <div className="error-notification">{error}</div>
          ) : mostRecentOrder ? (
            <div className="recent-order-details">
              <div className="order-detail-card">
                <div className="order-overview">
                  <h3 className="order-info-header">Order Information</h3>

                  <p>
                    <strong>Order ID:</strong> {mostRecentOrder.id}
                  </p>
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {mostRecentOrder.orderCreatedAt
                      ? new Date(
                          mostRecentOrder.orderCreatedAt.seconds * 1000
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Order Total:</strong> ₹
                    {mostRecentOrder.totalAmount || "N/A"}
                  </p>
                </div>
                <div className="shipping-info-section">
                  {mostRecentOrder.shippingInfo ? (
                    <>
                      <h3 className="shipping-info-header">
                        Shipping Information
                      </h3>
                      <div className="shipping-details">
                        <div className="shipping-primary-info">
                          <p>
                            <strong>Name:</strong>{" "}
                            {mostRecentOrder.shippingInfo.name || "N/A"}
                          </p>
                          <p>
                            <strong>Phone Number:</strong>{" "}
                            {mostRecentOrder.shippingInfo.number || "N/A"}
                          </p>
                        </div>
                        <div className="shipping-secondary-info">
                          <p>
                            {mostRecentOrder.shippingInfo.flat || "N/A"},{" "}
                            {mostRecentOrder.shippingInfo.street || "N/A"},{" "}
                            {mostRecentOrder.shippingInfo.locality || "N/A"},{" "}
                            {mostRecentOrder.shippingInfo.city || "N/A"},{" "}
                            {mostRecentOrder.shippingInfo.state || "N/A"},{" "}
                            {mostRecentOrder.shippingInfo.pinCode || "N/A"}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>No shipping information available.</p>
                  )}
                </div>
              </div>
              <div className="order-items-list">
                <h3 className="ordered-items-header">Items Ordered:</h3>
                <ul>
                  {mostRecentOrder.cartItems?.map((item, idx) => (
                    <div className="order-item-card" key={idx}>
                      <img src={item.Img} alt={item.Name} />
                      <div className="order-item-details">
                        <p>
                          <strong>Name:</strong> {item.Name || "N/A"}
                        </p>
                        <p>
                          <strong>Category:</strong> {item.Category || "N/A"}
                        </p>
                        <p>
                          <strong>Size:</strong> {item.size || "N/A"}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {item.quantity || 1}
                        </p>
                        <p>
                          <strong>Price:</strong> ₹{item.price || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>No recent orders found.</p>
          )}
        </div>
      </div>

      <button
        className="view-all-orders-btn"
        onClick={() => navigate("/Order")}
      >
        See All Orders
      </button>
      <button className="continue-shopping-btn" onClick={() => navigate("/")}>
        Continue Shopping
      </button>
    </div>
  );
};

export default Payment;
