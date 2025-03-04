import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../db/Firebase";

// CSS Styles
const styles = `
.pod-admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.pod-admin-header {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.pod-admin-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.pod-controls {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.pod-search {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.pod-search input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pod-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.pod-filter select {
  padding: 9px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.pod-table-container {
  overflow-x: auto;
}

.pod-table {
  width: 100%;
  border-collapse: collapse;
}

.pod-table th {
  text-align: left;
  padding: 12px 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  font-weight: bold;
  color: #555;
}

.pod-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.pod-table tr:hover {
  background-color: #f5f5f5;
}

.pod-sort-button {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  color: inherit;
}

.pod-images {
  display: flex;
  gap: 8px;
}

.pod-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.pod-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.pod-status-pending {
  background-color: #fff8e1;
  color: #f57c00;
}

.pod-status-processing {
  background-color: #e3f2fd;
  color: #1976d2;
}

.pod-status-completed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.pod-status-cancelled {
  background-color: #ffebee;
  color: #d32f2f;
}

.pod-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.pod-action-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
}

.pod-view-button {
  color: #5c6bc0;
}

.pod-edit-button {
  color: #26a69a;
}

.pod-delete-button {
  color: #ef5350;
}

.pod-footer {
  padding: 15px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #666;
}

.pod-detail-container {
  padding: 20px;
}

.pod-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.pod-detail-title {
  font-size: 20px;
  font-weight: bold;
}

.pod-back-button {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pod-detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

@media (min-width: 768px) {
  .pod-detail-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.pod-detail-section {
  margin-bottom: 20px;
}

.pod-detail-section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

.pod-detail-item {
  margin-bottom: 12px;
}

.pod-detail-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.pod-detail-value {
  font-size: 15px;
}

.pod-designs {
  margin-top: 30px;
}

.pod-design-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .pod-design-container {
    grid-template-columns: 1fr 1fr;
  }
}

.pod-design-item {
  margin-bottom: 20px;
}

.pod-design-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.pod-design-image {
  width: 100%;
  max-height: 250px;
  object-fit: contain;
  border: 1px solid #eee;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .pod-date-cell {
    display: none;
  }
  
  .pod-quality-cell {
    display: none;
  }
}

@media (max-width: 480px) {
  .pod-controls {
    flex-direction: column;
  }
  
  .pod-filter {
    width: 100%;
  }
  
  .pod-filter select {
    width: 100%;
  }
}
`;

const PrintOnDemandAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchPrintOnDemandData = async () => {
      try {
        setLoading(true);
        const podOrders = [];

        // This needs to be adjusted to match your exact Firestore structure
        const usersSnapshot = await getDocs(collection(db, "users"));

        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          const podCollectionRef = collection(
            db,
            `users/${userId}/PrintOnDemand`
          );
          const podSnapshot = await getDocs(podCollectionRef);

          podSnapshot.forEach((doc) => {
            podOrders.push({
              id: doc.id,
              userId: userId,
              ...doc.data(),
            });
          });
        }

        setOrders(podOrders);
      } catch (error) {
        console.error("Error fetching PrintOnDemand data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrintOnDemandData();
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredOrders = orders
    .filter((order) => filterStatus === "All" || order.status === filterStatus)
    .filter(
      (order) =>
        searchTerm === "" ||
        order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderId &&
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "timestamp") {
        const dateA =
          a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const dateB =
          b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      } else {
        const valA = a[sortBy] || "";
        const valB = b[sortBy] || "";
        return sortOrder === "asc"
          ? valA.toString().localeCompare(valB.toString())
          : valB.toString().localeCompare(valA.toString());
      }
    });

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setActiveTab("detail");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "pod-status-pending";
      case "Processing":
        return "pod-status-processing";
      case "Completed":
        return "pod-status-completed";
      case "Cancelled":
        return "pod-status-cancelled";
      default:
        return "";
    }
  };

  // Format timestamp for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    let date;

    // Check if timestamp is a Firestore Timestamp
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
    } else {
      date = new Date(timestamp);
    }

    // Validate date
    if (isNaN(date.getTime())) {
      return timestamp.toString();
    }

    // Format date as dd/mm/yyyy
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pod-admin-container">
        <h1 className="pod-admin-header">Print On Demand Admin Dashboard</h1>

        {loading ? (
          <div className="pod-admin-card">
            <div style={{ padding: "30px", textAlign: "center" }}>
              Loading orders data...
            </div>
          </div>
        ) : activeTab === "list" ? (
          <div className="pod-admin-card">
            <div className="pod-controls">
              <div className="pod-search">
                <span className="pod-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="pod-filter">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="pod-table-container">
              <table className="pod-table">
                <thead>
                  <tr>
                    <th>Images</th>
                    <th>
                      <button
                        className="pod-sort-button"
                        onClick={() => handleSort("userId")}
                      >
                        User ID{" "}
                        {sortBy === "userId"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </button>
                    </th>
                    <th>
                      <button
                        className="pod-sort-button"
                        onClick={() => handleSort("status")}
                      >
                        Status{" "}
                        {sortBy === "status"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </button>
                    </th>
                    <th>
                      <button
                        className="pod-sort-button"
                        onClick={() => handleSort("orderId")}
                      >
                        OrderId{" "}
                        {sortBy === "OrderId"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </button>
                    </th>
                    <th>
                      <button
                        className="pod-sort-button"
                        onClick={() => handleSort("price")}
                      >
                        Price{" "}
                        {sortBy === "price"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </button>
                    </th>
                    <th className="pod-date-cell">
                      <button
                        className="pod-sort-button"
                        onClick={() => handleSort("timestamp")}
                      >
                        Date{" "}
                        {sortBy === "timestamp"
                          ? sortOrder === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </button>
                    </th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{ textAlign: "center", padding: "30px" }}
                      >
                        {searchTerm || filterStatus !== "All"
                          ? "No orders match your filter criteria"
                          : "No orders found in the database"}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className="pod-images">
                            {order.frontImageURL && (
                              <img
                                src={order.frontImageURL}
                                alt="Front design"
                                className="pod-image"
                              />
                            )}
                            {order.backImageURL && (
                              <img
                                src={order.backImageURL}
                                alt="Back design"
                                className="pod-image"
                              />
                            )}
                          </div>
                        </td>
                        <td>{order.userId}</td>
                        <td>
                          <span
                            className={`pod-status ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="pod-quality-cell">{order.orderId}</td>
                        <td>₹{order.price}</td>
                        <td className="pod-date-cell">
                          {formatDate(order.timestamp)}
                        </td>
                        <td>
                          <div className="pod-actions">
                            <button
                              onClick={() => viewOrder(order)}
                              className="pod-action-button pod-view-button"
                              title="View details"
                            >
                              👁️
                            </button>
                            <button
                              className="pod-action-button pod-edit-button"
                              title="Edit order"
                            >
                              ✏️
                            </button>
                            <button
                              className="pod-action-button pod-delete-button"
                              title="Delete order"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pod-footer">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        ) : (
          <div className="pod-admin-card">
            {selectedOrder && (
              <div className="pod-detail-container">
                <div className="pod-detail-header">
                  <h2 className="pod-detail-title">Order Details</h2>
                  <button
                    onClick={() => setActiveTab("list")}
                    className="pod-back-button"
                  >
                    Back to List
                  </button>
                </div>

                <div className="pod-detail-grid">
                  <div className="pod-detail-section">
                    <h3 className="pod-detail-section-title">
                      Order Information
                    </h3>

                    <div className="pod-detail-item">
                      <div className="pod-detail-label">Order ID</div>
                      <div className="pod-detail-value">{selectedOrder.id}</div>
                    </div>

                    <div className="pod-detail-item">
                      <div className="pod-detail-label">User ID</div>
                      <div
                        className="pod-detail-value"
                        style={{ wordBreak: "break-all" }}
                      >
                        {selectedOrder.userId}
                      </div>
                    </div>

                    <div className="pod-detail-item">
                      <div className="pod-detail-label">Status</div>
                      <div className="pod-detail-value">
                        <span
                          className={`pod-status ${getStatusClass(
                            selectedOrder.status
                          )}`}
                        >
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>

                    <div className="pod-detail-item">
                      <div className="pod-detail-label">Price</div>
                      <div className="pod-detail-value">
                        ₹{selectedOrder.price}
                      </div>
                    </div>

                    <div className="pod-detail-item">
                      <div className="pod-detail-label">Date</div>
                      <div className="pod-detail-value">
                        {formatDate(selectedOrder.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="pod-detail-section">
                    <h3 className="pod-detail-section-title">
                      Product Specifications
                    </h3>

                    <div className="pod-detail-item">
                      <div className="pod-detail-label">Cloth Quality</div>
                      <div className="pod-detail-value">
                        {selectedOrder.clothQuality}
                      </div>
                    </div>

                    <div className="pod-detail-item">
                      <div className="pod-detail-label">Thickness</div>
                      <div className="pod-detail-value">
                        {selectedOrder.thickness}
                      </div>
                    </div>

                    <div className="pod-detail-item">
                      <div className="pod-detail-label">Puff Print</div>
                      <div className="pod-detail-value">
                        {selectedOrder.puff ? "Yes" : "No"}
                      </div>
                    </div>

                    <div className="pod-detail-item">
                      <div className="pod-detail-label">Custom Request</div>
                      <div className="pod-detail-value">
                        {selectedOrder.customRequest}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pod-designs">
                  <h3 className="pod-detail-section-title">Design Preview</h3>
                  <div className="pod-design-container">
                    <div className="pod-design-item">
                      <div className="pod-design-label">Front Design</div>
                      {selectedOrder.frontImageURL ? (
                        <img
                          src={selectedOrder.frontImageURL}
                          alt="Front design"
                          className="pod-design-image"
                        />
                      ) : (
                        <div>No front image available</div>
                      )}
                    </div>

                    <div className="pod-design-item">
                      <div className="pod-design-label">Back Design</div>
                      {selectedOrder.backImageURL ? (
                        <img
                          src={selectedOrder.backImageURL}
                          alt="Back design"
                          className="pod-design-image"
                        />
                      ) : (
                        <div>No back image available</div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "30px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Update Status
                  </button>
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PrintOnDemandAdmin;
