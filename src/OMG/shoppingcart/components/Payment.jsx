import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { firebaseApp } from "../../db/Firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faSpinner,
  faBox,
  faTruck,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./Payment.css";
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const statusIcons = {
    Pending: (
      <FontAwesomeIcon icon={faClock} size="1x" className="icon-color" />
    ), // Large icon
    Processing: (
      <FontAwesomeIcon icon={faSpinner} size="xl" spin className="icon-color" />
    ), // Large with spin effect
    Shipped: <FontAwesomeIcon icon={faBox} size="xl" className="icon-color" />,
    "Out for Delivery": (
      <FontAwesomeIcon icon={faTruck} size="xl" className="icon-color" />
    ),
    Delivered: (
      <FontAwesomeIcon icon={faCheckCircle} size="xl" className="icon-color" />
    ),
  };
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

  const calculateEstimatedDate = (
    orderCreatedAt,
    currentStatus,
    targetStatus
  ) => {
    const statusOrder = [
      "Pending",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const targetIndex = statusOrder.indexOf(targetStatus);

    const orderDate = orderCreatedAt?.seconds
      ? new Date(orderCreatedAt.seconds * 1000)
      : new Date();

    // If the target status is before or equal to current status, return actual date
    if (targetIndex <= currentIndex) {
      return new Date();
    }

    const processingTimes = {
      "Pending-Processing": 1, // 1 day from Pending to Processing
      "Processing-Shipped": 2, // 2 days from Processing to Shipped
      "Shipped-Out for Delivery": 2, // 2 days from Shipped to Out for Delivery
      "Out for Delivery-Delivered": 0, // 1 day from Out for Delivery to Delivered
    };

    // Calculate total days to add from current status
    let daysToAdd = 0;
    for (let i = currentIndex; i < targetIndex; i++) {
      const transition = `${statusOrder[i]}-${statusOrder[i + 1]}`;
      daysToAdd += processingTimes[transition] || 0;
    }
    const estimatedDate = new Date(orderDate.getTime());
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);

    return estimatedDate;
  };

  const getStatusHistory = (order) => {
    if (!order || !order.orderCreatedAt) return [];

    const currentStatus = order.status || "Pending";

    return [
      {
        status: "Pending",
        date: order.orderCreatedAt,
        description: "Order placed and payment confirmed",
        estimatedCompletion: calculateEstimatedDate(
          order.orderCreatedAt,
          currentStatus,
          "Pending"
        ),
      },
      {
        status: "Processing",
        date: order.processingAt || null,
        description: "The order is being prepared for shipping",
        estimatedCompletion: calculateEstimatedDate(
          order.orderCreatedAt,
          currentStatus,
          "Processing"
        ),
      },
      {
        status: "Shipped",
        date: order.shippedAt || null,
        description: "Package has left our warehouse",
        estimatedCompletion: calculateEstimatedDate(
          order.orderCreatedAt,
          currentStatus,
          "Shipped"
        ),
      },
      {
        status: "Out for Delivery",
        date: order.outForDeliveryAt || null,
        description: "The Order is out for delivery",
        estimatedCompletion: calculateEstimatedDate(
          order.orderCreatedAt,
          currentStatus,
          "Out for Delivery"
        ),
      },
      {
        status: "Delivered",
        date: order.deliveredAt || null,
        description: "Package has been delivered",
        estimatedCompletion: calculateEstimatedDate(
          order.orderCreatedAt,
          currentStatus,
          "Delivered"
        ),
      },
    ];
  };

  const getStatusIndex = (status) => {
    const statusOrder = [
      "Pending",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];
    return status === "Cancelled" ? -1 : statusOrder.indexOf(status);
  };

  const renderOrderStatus = () => {
    if (!mostRecentOrder) return null;

    if (mostRecentOrder.status === "Cancelled") {
      return (
        <div className="payment-cancelled-status">
          <div className="payment-cancelled-icon">✕</div>
          <p>Order Cancelled</p>
          {mostRecentOrder.cancelledAt && (
            <p className="payment-cancelled-date">
              Cancelled on:{" "}
              {new Date(
                mostRecentOrder.cancelledAt.seconds * 1000
              ).toLocaleString()}
            </p>
          )}
          {mostRecentOrder.cancellationReason && (
            <p className="payment-cancellation-reason">
              Reason: {mostRecentOrder.cancellationReason}
            </p>
          )}
        </div>
      );
    }
    const currentStatusIndex = getStatusIndex(mostRecentOrder.status);
    return (
      <div className="payment-status-tracker">
        <div className="payment-status-line"></div>
        <div className="payment-status-points">
          {getStatusHistory(mostRecentOrder).map((statusData, index) => {
            const isActive = index === currentStatusIndex;
            const isPast = index < currentStatusIndex;

            return (
              <div
                key={statusData.status}
                className={`payment-status-point ${isActive ? "active" : ""} ${
                  isPast ? "past" : ""
                }`}
                onClick={() => setShowTimeline(true)}
              >
                <div className="payment-status-connector"></div>
                <div className="payment-status-dot"></div>
                <div className="payment-status-icon">
                  {statusIcons[statusData.status]}
                </div>
                <div className="payment-status-label">{statusData.status}</div>
                <div className="payment-status-date">
                  {statusData.date
                    ? new Date(
                        statusData.date.seconds * 1000
                      ).toLocaleDateString()
                    : `Est. ${statusData.estimatedCompletion.toLocaleDateString()}`}
                </div>
                <div className="payment-status-tooltip">
                  {statusData.description}
                  <br />
                  {!statusData.date && "Estimated: "}
                  {statusData.date
                    ? new Date(statusData.date.seconds * 1000).toLocaleString()
                    : statusData.estimatedCompletion.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="payment-loading-indicator">Loading...</div>;
  }

  if (error) {
    return <div className="payment-error-notification">{error}</div>;
  }

  if (!mostRecentOrder) {
    return (
      <div className="payment-container">
        <h1 className="payment-header">No Orders Found</h1>
        <button
          className="payment-btn payment-btn-primary"
          onClick={() => navigate("/")}
        >
          Start Shopping
        </button>
      </div>
    );
  }
  return (
    <div className="payment-container">
      <div className="payment-header">
        <div className="payment-header-content">
          <h1>Thank You for Your Order</h1>
          <span>Your order has been placed successfully.</span>
        </div>

        <div className="payment-button-group">
          <button
            className="payment-btn payment-btn-secondary"
            onClick={() => navigate("/Order")}
          >
            See All Orders
          </button>
          <button
            className="payment-btn payment-btn-primary"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {renderOrderStatus()}

      {/* Timeline Modal (keep the existing code, but update class names) */}

      <div className="payment-order-summary">
        <h2>Order Details</h2>
        <div className="payment-order-content">
          <div className="payment-order-detail-card">
            <div className="payment-order-overview">
              <h3>Order Information</h3>
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
            <div className="payment-shipping-info-section">
              {mostRecentOrder.shippingInfo ? (
                <>
                  <h3>Shipping Information</h3>
                  <div className="payment-shipping-details">
                    <p>
                      <strong>Name:</strong>{" "}
                      {mostRecentOrder.shippingInfo.name || "N/A"}
                    </p>
                    <p>
                      <strong>Phone Number:</strong>{" "}
                      {mostRecentOrder.shippingInfo.number || "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {`${mostRecentOrder.shippingInfo.flat || "N/A"}, 
                      ${mostRecentOrder.shippingInfo.street || "N/A"}, 
                      ${mostRecentOrder.shippingInfo.locality || "N/A"}, 
                      ${mostRecentOrder.shippingInfo.city || "N/A"}, 
                      ${mostRecentOrder.shippingInfo.state || "N/A"}, 
                      ${mostRecentOrder.shippingInfo.pinCode || "N/A"}`}
                    </p>
                  </div>
                </>
              ) : (
                <p>No shipping information available.</p>
              )}
            </div>
          </div>
          <div className="payment-order-items-list">
            <h3>Items Ordered</h3>
            {mostRecentOrder.cartItems?.map((item, idx) => (
              <div className="payment-order-item-card" key={idx}>
                <img src={item.Img || "/placeholder.svg"} alt={item.Name} />
                <div className="payment-order-item-details">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
