import React, { useEffect, useState } from "react";
import { firestore } from "../../db/Firebase";
import {
  collectionGroup,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import "./OrdersDash.css";
import { FidgetSpinner } from "react-loader-spinner";

const OrdersDash = ({ userId, orderId }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc"); // Default to newest first
  const [status, setStatus] = useState("Pending");
  const [error, setError] = useState(null);
  const validStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  useEffect(() => {
    // Using onSnapshot for real-time updates
    const unsubscribe = onSnapshot(
      collectionGroup(firestore, "orders"),
      (ordersSnapshot) => {
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.ref.parent.parent.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    );

    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (!validStatuses.includes(newStatus)) {
        setError("Invalid status selected");
        return;
      }

      // Find the order to get its userId
      const orderToUpdate = orders.find((order) => order.id === orderId);
      if (!orderToUpdate) {
        setError("Order not found");
        return;
      }

      const orderRef = doc(
        firestore,
        "users",
        orderToUpdate.userId,
        "orders",
        orderId
      );

      setLoading(true);
      await updateDoc(orderRef, {
        status: newStatus,
      });

      setError(null); // Clear any previous errors
      setLoading(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update status. Please try again later.");
      setLoading(false);
    }
  };

  const getFilteredAndSortedOrders = () => {
    const filtered =
      filter === "All"
        ? orders
        : orders.filter((order) => order.status === filter);
    return sortOrders(filtered);
  };

  const sortOrders = (ordersToSort) => {
    return [...ordersToSort].sort((a, b) => {
      const dateA = a.orderCreatedAt?.seconds || 0;
      const dateB = b.orderCreatedAt?.seconds || 0;
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
  };

  // Filter and sort orders
  const filteredAndSortedOrders = getFilteredAndSortedOrders();
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredAndSortedOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <FidgetSpinner
        visible={true}
        height="80"
        width="80"
        ariaLabel="fidget-spinner-loading"
        wrapperClass="fidget-spinner-wrapper"
      />
    );
  }

  return (
    <div className="admin-orders">
      <h1>Orders Dashboard</h1>
      {/* Filter Orders */}
      <div className="filter-section">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <div className="sort-section">
          <button onClick={toggleSortOrder} className="sort-button">
            Sort by Date {sortOrder === "desc" ? "↓" : "↑"}
          </button>
        </div>
      </div>
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User Email</th>
              <th>Total Amount</th>
              <th>Order Date</th>
              <th>Actions</th>
              <th>view</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
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
                    <select
                      value={order.status || "Pending"}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                    >
                      {validStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
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
      {/* Pagination */}
      <div className="pagination">
        {Array.from(
          { length: Math.ceil(filteredAndSortedOrders.length / ordersPerPage) },
          (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          )
        )}
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
            {/* Order Status */}
            <div className="order-section">
              <h3>Order Status</h3>
              <p>
                <strong>Status:</strong> {selectedOrder.status || "Pending"}
              </p>
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
