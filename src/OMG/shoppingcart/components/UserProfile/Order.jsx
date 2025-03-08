import React from "react";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { firebaseApp } from "../../../db/Firebase"; // Adjust this path to your Firebase initialization
import "./Userstyles/Order.css";
import {
  FaArrowRight,
  FaArrowDown,
  FaArrowLeft,
  FaArrowUp,
  FaParachuteBox,
  FaMapPin,
  FaUser,
  FaPhone,
  FaCalendar,
  FaEnvelopeOpenText,
  FaShoppingBag,
} from "react-icons/fa";

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

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

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);

    // Initialize expanded sections when opening an order
    if (expandedOrderId !== orderId) {
      setExpandedSections({
        orderItems: true,
        shippingInfo: true,
        orderSummary: true,
      });
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateOrderTotal = (items) => {
    if (!items || !items.length) return 0;
    return items.reduce(
      (total, item) => total + item.discountedPrice * (item.quantity || 1),
      0
    );
  };

  return (
    <>
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>
            {orders.length} {orders.length === 1 ? "order" : "orders"} found
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <FaShoppingBag size={48} />
            <h2>No orders yet</h2>
            <p>When you place orders, they will appear here</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`order-card ${
                  expandedOrderId === order.id ? "expanded" : ""
                }`}
              >
                <div
                  className="order-card-header"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="order-basic-info">
                    <div className="order-id">
                      <span className="label">Order ID:</span>
                      <span className="value">{order.id}</span>
                    </div>
                    <div className="order-date">
                      <FaCalendar size={14} />
                      <span>{formatDate(order.orderCreatedAt)}</span>
                    </div>
                  </div>

                  <div className="order-summary-preview">
                    <div className="order-items-count">
                      <FaParachuteBox size={14} />
                      <span>{order.cartItems?.length || 0} items</span>
                    </div>
                    <div className="order-total-preview">
                      <span className="label">Total:</span>
                      <span className="value">
                        ₹
                        {order.totalAmount ||
                          calculateOrderTotal(order.cartItems)}
                      </span>
                    </div>
                  </div>

                  <div className="order-toggle-icon">
                    {expandedOrderId === order.id ? (
                      <FaArrowUp />
                    ) : (
                      <FaArrowDown />
                    )}
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="order-details">
                    <div className="order-details-grid">
                      {/* Order Items Section */}
                      <div className="order-section order-items-section">
                        <div
                          className="section-header"
                          onClick={() => toggleSection("orderItems")}
                        >
                          <h3>
                            <FaShoppingBag size={16} />
                            Order Items
                          </h3>
                          <button className="toggle-section">
                            {expandedSections.orderItems ? (
                              <FaArrowUp size={16} />
                            ) : (
                              <FaArrowDown size={16} />
                            )}
                          </button>
                        </div>

                        {expandedSections.orderItems && (
                          <div className="section-content">
                            <div className="order-items-list">
                              {order.cartItems?.map((item, idx) => (
                                <div className="order-item" key={idx}>
                                  <div className="item-image">
                                    <img
                                      src={item.Img || "/placeholder.svg"}
                                      alt={item.Name || "Product"}
                                    />
                                  </div>
                                  <div className="item-details">
                                    <h4>{item.Name || "Product Name"}</h4>
                                    <div className="item-meta">
                                      {item.Category && (
                                        <span className="item-category">
                                          {item.Category}
                                        </span>
                                      )}
                                      {item.size && (
                                        <span className="item-size">
                                          Size: {item.size}
                                        </span>
                                      )}
                                      <span className="item-quantity">
                                        Qty: {item.quantity || 1}
                                      </span>
                                    </div>
                                    <div className="item-price">
                                      ₹{item.discountedPrice || 0}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Shipping Information Section */}
                      <div className="order-section shipping-info-section">
                        <div
                          className="section-header"
                          onClick={() => toggleSection("shippingInfo")}
                        >
                          <h3>
                            <FaMapPin size={16} />
                            Shipping Information
                          </h3>
                          <button className="toggle-section">
                            {expandedSections.shippingInfo ? (
                              <FaArrowUp size={16} />
                            ) : (
                              <FaArrowDown size={16} />
                            )}
                          </button>
                        </div>

                        {expandedSections.shippingInfo && (
                          <div className="section-content">
                            {order.shippingInfo ? (
                              <div className="shipping-details">
                                <div className="shipping-contact">
                                  <div className="contact-item">
                                    <FaUser size={14} />
                                    <span>
                                      {order.shippingInfo.name || "N/A"}
                                    </span>
                                  </div>
                                  <div className="contact-item">
                                    <FaPhone size={14} />
                                    <span>
                                      {order.shippingInfo.number || "N/A"}
                                    </span>
                                  </div>
                                </div>
                                <div className="shipping-address">
                                  <FaMapPin size={14} />
                                  <p>
                                    {[
                                      order.shippingInfo.flat,
                                      order.shippingInfo.street,
                                      order.shippingInfo.locality,
                                      order.shippingInfo.city,
                                      order.shippingInfo.state,
                                      order.shippingInfo.pinCode,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="no-info">
                                No shipping information available.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Order Summary Section */}
                      <div className="order-section order-summary-section">
                        <div
                          className="section-header"
                          onClick={() => toggleSection("orderSummary")}
                        >
                          <h3>
                            <FaEnvelopeOpenText size={16} />
                            Order Summary
                          </h3>
                          <button className="toggle-section">
                            {expandedSections.orderSummary ? (
                              <FaArrowUp size={16} />
                            ) : (
                              <FaArrowDown size={16} />
                            )}
                          </button>
                        </div>

                        {expandedSections.orderSummary && (
                          <div className="section-content">
                            <div className="order-summary">
                              <div className="summary-row">
                                <span>Subtotal</span>
                                <span>
                                  ₹{" "}
                                  {calculateOrderTotal(
                                    order.cartItems
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <div className="summary-row">
                                <span>Shipping</span>
                                <span>₹{order.shippingCost || 0}</span>
                              </div>
                              <div className="summary-row">
                                <span>Discount</span>
                                <span>-₹{order.discountAmount || 0}</span>
                              </div>
                              <div className="summary-row total">
                                <span>Total</span>
                                <span>
                                  ₹
                                  {order.totalAmount ||
                                    calculateOrderTotal(order.cartItems)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="order-actions">
                      <button
                        className="action-button secondary"
                        onClick={() => toggleOrderDetails(null)}
                      >
                        <FaArrowDown size={16} />
                        Back to Orders
                      </button>
                      <button className="action-button primary">
                        Track Order
                        <FaArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Orders;
