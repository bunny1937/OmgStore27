import React from "react";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { firebaseApp } from "../../../db/Firebase"; // Adjust this path to your Firebase initialization
import "./Userstyles/Order.css";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

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
  };
  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="orders">
        <h2>My Orders</h2>
        <div className="orders-section">
          {orders.length > 0 ? (
            <ul className="orders-list">
              {orders.map((order) => (
                <li key={order.id} className="order-item">
                  <div className="order-item-header">
                    {/* List and toggle arrow */}
                    {expandedOrderId !== order.id ? (
                      <>
                        <div className="order-cart-list">
                          {order.cartItems?.map((item, idx) => (
                            <div className="order-cart-box" key={idx}>
                              <div className="order-header">
                                <img src={item.Img} alt={item.Name} />
                                <div className="order-header-items">
                                  <p>
                                    <strong>Name:</strong> {item.Name || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Price:</strong> ₹{item.price || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className="order-toggle"
                          onClick={() => toggleOrderDetails(order.id)}
                        >
                          <FiArrowRight />
                        </div>
                      </>
                    ) : (
                      /* Expanded view with only details boxes */
                      <>
                        <div className="order-detail-box">
                          <div className="order-detail">
                            <div className="order-main">
                              <p>
                                <strong>Order ID:</strong> {order.id}
                              </p>
                              <p>
                                <strong>Order Date:</strong>
                                {order.orderCreatedAt
                                  ? new Date(
                                      order.orderCreatedAt.seconds * 1000
                                    ).toLocaleString()
                                  : "N/A"}
                              </p>
                              <p>
                                <strong>Order Total:</strong> ₹
                                {order.totalAmount || "N/A"}
                              </p>
                            </div>
                            <div className="order-address">
                              {order.shippingInfo ? (
                                <>
                                  <h3>Shipping Information</h3>
                                  <div className="shipping-form">
                                    <div className="shipping-info-one">
                                      <p>
                                        <strong>Name:</strong>
                                        {order.shippingInfo.name || "N/A"}
                                      </p>
                                      <p>
                                        <strong>Phone Number:</strong>
                                        {order.shippingInfo.number || "N/A"}
                                      </p>
                                    </div>
                                    <div className="shipping-info-two">
                                      <p>
                                        {order.shippingInfo.flat || "N/A"},
                                        {order.shippingInfo.street || "N/A"},
                                        {order.shippingInfo.locality || "N/A"},
                                        {order.shippingInfo.city || "N/A"},
                                        {order.shippingInfo.state || "N/A"},
                                        {order.shippingInfo.pinCode || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <p>No shipping information available.</p>
                              )}
                            </div>
                          </div>
                          <div className="order-info">
                            <h3>Items Ordered:</h3>
                            <ul>
                              {order.cartItems?.map((item, idx) => (
                                <div className="order-cart-box">
                                  <img src={item.Img} alt={item.Name} />
                                  <div className="order-item-grid" key={idx}>
                                    <p>
                                      <strong>Name:</strong>{" "}
                                      {item.Name || "N/A"}
                                    </p>
                                    <p>
                                      <strong>Category:</strong>{" "}
                                      {item.Category || "N/A"}
                                    </p>
                                    <p>
                                      <strong>Size:</strong>{" "}
                                      {item.size || "N/A"}
                                    </p>
                                    <p>
                                      <strong>Quantity:</strong>{" "}
                                      {item.quantity || 1}
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

                        <div
                          className="order-toggle"
                          onClick={() => toggleOrderDetails(null)} // Close toggle
                        >
                          <FiArrowLeft />
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no orders.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Order;
