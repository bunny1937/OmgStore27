import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa"; // Import the Material Edit icon from React Icons

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "../db/Firebase"; // Adjust this path to your Firebase initialization
import { motion } from "framer-motion"; // For animations
import "./UserProfile.css"; // Import modern styles

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

function UserProfile() {
  const [cart, setCart] = useState([]);
  const [shippingInfo, setShippingInfo] = useState([]);
  const [orders, setOrders] = useState([]);

  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchUserDetails = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserInfo({
            email: userDoc.data().email || "",
            firstName: userDoc.data().firstName || "",
            lastName: userDoc.data().lastName || "",
            phoneNumber: userDoc.data().phoneNumber || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    setLoading(false);
  };

  const updateUserDetails = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          phoneNumber: userInfo.phoneNumber,
        });
        alert("Profile updated successfully!");
        setEditing(false);
      } catch (error) {
        console.error("Error updating user details:", error);
        alert("Failed to update profile.");
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Fetch Cart Data
  const fetchCart = async (uid) => {
    const cartCollection = collection(db, "users", uid, "Cart");
    const cartSnapshot = await getDocs(cartCollection);
    const cartData = cartSnapshot.docs.map((doc) => doc.data());
    setCart(cartData);
  };

  // Fetch Shipping Info Data
  const fetchShippingInfo = async (uid) => {
    try {
      const shippingCollection = collection(db, "users", uid, "ShippingInfo");
      const shippingSnapshot = await getDocs(shippingCollection);
      const shippingData = shippingSnapshot.docs.map((doc) => ({
        id: doc.id, // Add document ID here
        ...doc.data(),
      }));
      setShippingInfo(shippingData);
    } catch (error) {
      console.error("Error fetching shipping info:", error.message);
    }
  };

  const enableEditing = (index) => {
    setShippingInfo((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, editing: true } : item
      )
    );
  };

  const cancelEdit = (index) => {
    setShippingInfo((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, editing: false } : item
      )
    );
  };
  const saveShippingInfo = async (info, index) => {
    try {
      if (!info.id) {
        throw new Error("Document ID is missing.");
      }
      const docRef = doc(db, "users", user.uid, "ShippingInfo", info.id);
      await updateDoc(docRef, {
        name: info.name,
        number: info.number,
        flat: info.flat,
        street: info.street,
        locality: info.locality,
        city: info.city,
        state: info.state,
        pinCode: info.pinCode,
      });

      setShippingInfo((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? { ...item, ...info, editing: false } // Update local state
            : item
        )
      );

      alert("Shipping info updated successfully!");
    } catch (error) {
      console.error("Error updating shipping info:", error.message);
      alert("Failed to update shipping info. Please try again.");
    }
  };

  // Fetch Orders Data
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
        setUser(currentUser);
        fetchUserDetails(currentUser.uid);
        fetchCart(currentUser.uid);
        fetchShippingInfo(currentUser.uid);
        fetchOrders(currentUser.uid);
      } else {
        setUser(null);
        setCart([]);
        setShippingInfo([]);
        setOrders([]);
      }
      setLoading(false);
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);
  if (loading) return <div>Loading...</div>;

  return (
    <motion.div
      className="profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="left">
        <motion.section
          className="profile-card"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="profile-grid">
            <label>
              Email:
              <input
                type="email"
                value={userInfo.email}
                disabled
                className="input"
              />
            </label>
            <label>
              First Name:
              <input
                type="text"
                value={userInfo.firstName}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, firstName: e.target.value })
                }
                disabled={!editing}
                className="input"
              />
            </label>
            <label>
              Last Name:
              <input
                type="text"
                value={userInfo.lastName}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, lastName: e.target.value })
                }
                disabled={!editing}
                className="input"
              />
            </label>
            <label>
              Phone Number:
              <input
                type="text"
                value={userInfo.phoneNumber}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, phoneNumber: e.target.value })
                }
                disabled={!editing}
                className="input"
              />
            </label>
          </div>
          <div className="button-group">
            {editing ? (
              <button
                onClick={updateUserDetails}
                className="button save-button"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="button edit-button"
              >
                Edit
              </button>
            )}
            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="button cancel-button"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.section>

        {/* <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="cart-section"
      >
        <h2>Cart</h2>
        {cart.length > 0 ? (
          <ul className="cart-list">
            {cart.map((item, index) => (
              <li key={index} className="cart-item">
                <img
                  src={item.Img}
                  alt={item.Name}
                  className="cart-item-image"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                <div className="cart-item-details">
                  <p>
                    <strong>Name:</strong> {item.Name || "N/A"}
                  </p>
                  <p>
                    <strong>Category:</strong> {item.Category || "N/A"}
                  </p>
                  <p>
                    <strong>Price:</strong> ${item.price || 0}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {item.quantity || 1}
                  </p>
                  <p>
                    <strong>Size:</strong> {item.size || "N/A"}
                  </p>
                  <p>
                    <strong>Gender:</strong> {item.Gender || "N/A"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </motion.div> */}

        {/* Shipping Info */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="shipping-section"
        >
          <h2>Shipping Info</h2>
          {shippingInfo.map((info, index) => (
            <li className="shipping-info-li" key={info.id}>
              {info.editing ? (
                <div className="shipping-form-grid">
                  <label>
                    Name:
                    <input
                      type="text"
                      value={info.name}
                      placeholder="Name"
                      onChange={(e) =>
                        setShippingInfo((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, name: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </label>
                  <label>
                    Number:
                    <input
                      type="text"
                      value={info.number}
                      placeholder="Number"
                      onChange={(e) =>
                        setShippingInfo((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, number: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </label>
                  <label>
                    Flat:
                    <input
                      type="text"
                      value={info.flat}
                      placeholder="Flat"
                      onChange={(e) =>
                        setShippingInfo((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, flat: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </label>
                  <label>
                    Street:
                    <input
                      type="text"
                      value={info.street}
                      placeholder="Street"
                      onChange={(e) =>
                        setShippingInfo((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, street: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </label>
                  <label>
                    Locality:
                    <input
                      type="text"
                      value={info.locality}
                      placeholder="Locality"
                      onChange={(e) =>
                        setShippingInfo((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, locality: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </label>
                  <label>
                    City:
                    <input
                      type="text"
                      value={info.city}
                      placeholder="City"
                      onChange={(e) =>
                        setShippingInfo((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, city: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </label>
                  <label>
                    State:
                    <input
                      type="text"
                      value={info.state}
                      placeholder="State"
                      onChange={(e) =>
                        setShippingInfo((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, state: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </label>
                  <label>
                    Pin Code:
                    <input
                      type="text"
                      value={info.pinCode}
                      placeholder="Pin Code"
                      onChange={(e) =>
                        setShippingInfo((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, pinCode: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </label>
                  <div className="button-container">
                    <button onClick={() => saveShippingInfo(info, index)}>
                      Save
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() => cancelEdit(index)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="shipping-info-grid">
                  <p>
                    <strong>Name:</strong> {info.name}
                  </p>
                  <p>
                    <strong>Phn. No.:</strong> {info.number}
                  </p>
                  <p>
                    <strong>Flat:</strong> {info.flat}
                  </p>
                  <p>
                    <strong>Street:</strong> {info.street}
                  </p>
                  <p>
                    <strong>Locality:</strong> {info.locality}
                  </p>
                  <p>
                    <strong>City:</strong> {info.city}
                  </p>
                  <p>
                    <strong>State:</strong> {info.state}
                  </p>
                  <p>
                    <strong>Pin Code:</strong> {info.pinCode}
                  </p>
                  <button
                    className="edit-button"
                    onClick={() => enableEditing(index)}
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </li>
          ))}
        </motion.div>
      </div>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="orders-section"
      >
        <h1>Orders</h1>
        {orders.length > 0 ? (
          <ul className="orders-list">
            {orders.map((order, index) => (
              <li key={index} className="order-item">
                <div className="order-detail-grid">
                  <p>
                    <strong>Order ID:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Total:</strong> ₹{order.totalAmount || "N/A"}
                  </p>
                  <p>
                    <strong>Order Date:</strong>
                    {order.orderCreatedAt
                      ? new Date(
                          order.orderCreatedAt.seconds * 1000
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <h3>Items Ordered:</h3>

                <ul>
                  {order.cartItems?.map((item, idx) => (
                    <div className="order-cart-box">
                      <img
                        src={item.Img}
                        alt={item.Name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          marginRight: "10px",
                        }}
                      />
                      <div className="order-item-grid" key={idx}>
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
                  {order.shippingInfo ? (
                    <>
                      <h3>Shipping Information</h3>
                      <div className="shipping-form-grid">
                        <p>
                          <strong>Name:</strong>s
                          {order.shippingInfo.name || "N/A"}
                        </p>
                        <p>
                          <strong>Phone Number:</strong>s
                          {order.shippingInfo.number || "N/A"}
                        </p>
                        <p>
                          <strong>Flat:</strong>s
                          {order.shippingInfo.flat || "N/A"}
                        </p>
                        <p>
                          <strong>Street:</strong>s
                          {order.shippingInfo.street || "N/A"}
                        </p>
                        <p>
                          <strong>Locality:</strong>s
                          {order.shippingInfo.locality || "N/A"}
                        </p>
                        <p>
                          <strong>City:</strong>s
                          {order.shippingInfo.city || "N/A"}
                        </p>
                        <p>
                          <strong>State:</strong>s
                          {order.shippingInfo.state || "N/A"}
                        </p>
                        <p>
                          <strong>Pin Code:</strong>s
                          {order.shippingInfo.pinCode || "N/A"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p>No shipping information available.</p>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no orders.</p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default UserProfile;
