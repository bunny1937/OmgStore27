import React, { useEffect, useState } from "react";
import { firestore } from "./Firebase";
import { collectionGroup, onSnapshot } from "firebase/firestore";
import "./OrdersDash.css";

const OrdersDash = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Using onSnapshot for real-time updates
    const unsubscribe = onSnapshot(
      collectionGroup(firestore, "orders"),
      (ordersSnapshot) => {
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      },
      (error) => {
        console.error("Error fetching orders:", error);
      }
    );

    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  return (
    <div className="admin-orders">
      <h1>Orders Dashboard</h1>
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User Email</th>
              <th>Total Amount</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.userInfo?.email || "Unknown"}</td>
                  <td>₹{order.totalAmount?.toLocaleString()}</td>
                  <td>
                    {new Date(
                      order.orderCreatedAt?.seconds * 1000
                    ).toLocaleDateString()}
                  </td>
                  <td>
                    <button onClick={() => setSelectedOrder(order)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <button
              className="close-button"
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
            <h2>Order Details</h2>

            {/* User Info */}
            <div className="order-section">
              <h3>User Information</h3>
              <div className="info-grid">
                <p>
                  <strong>Email:</strong> {selectedOrder.userInfo?.email}
                </p>
                <p>
                  <strong>Name:</strong> {selectedOrder.userInfo?.firstName}{" "}
                  {selectedOrder.userInfo?.lastName}
                </p>
                <p>
                  <strong>Phone:</strong>
                  {selectedOrder.userInfo?.phoneNumber || "N/A"}
                </p>
                <p>
                  <strong>UserId:</strong>
                  {selectedOrder.userInfo?.userId || "N/A"}
                </p>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="order-section">
              <h3>Shipping Information</h3>
              <div className="order-by">
                <h2>Order by:</h2>
                <div className="info-user">
                  <div className="info-item">
                    <label>Name:</label>
                    <p>{selectedOrder.shippingInfo?.name || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>PhoneNo:</label>
                    <p>{selectedOrder.shippingInfo?.number || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="info-grid">
                <div>
                  <label>Flat Number:</label>
                  <p>{selectedOrder.shippingInfo?.flat || "N/A"}</p>
                </div>
                <div>
                  <label>Street:</label>
                  <p>{selectedOrder.shippingInfo?.street || "N/A"}</p>
                </div>
                <div>
                  <label>Locality:</label>
                  <p>{selectedOrder.shippingInfo?.locality || "N/A"}</p>
                </div>
                <div>
                  <label>City:</label>
                  <p>{selectedOrder.shippingInfo?.city || "N/A"}</p>
                </div>
                <div>
                  <label>State:</label>
                  <p>{selectedOrder.shippingInfo?.state || "N/A"}</p>
                </div>
                <div>
                  <label>ZIP Code:</label>
                  <p>{selectedOrder.shippingInfo?.zip || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="order-section">
              <h3>Cart Items</h3>
              <ul className="cart-items">
                {selectedOrder.cartItems?.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.Name}</strong> - ₹{item.price} x{" "}
                    {item.quantity} = ₹
                    {(item.price * item.quantity).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>

            {/* Total */}
            <p className="total-amount">
              <strong>Total Amount:</strong> ₹
              {selectedOrder.totalAmount?.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersDash;
