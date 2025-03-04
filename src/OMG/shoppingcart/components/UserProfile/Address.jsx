import React from "react";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa"; // Import the Material Edit icon from React Icons
import "./Userstyles/shipping.css";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "../../../db/Firebase";
import { motion } from "framer-motion";

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
function Address() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingInfo, setShippingInfo] = useState([]);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the authenticated user
        fetchShippingInfo(currentUser.uid); // Fetch shipping info for the user
      } else {
        setUser(null);
        setShippingInfo([]); // Clear shipping info if user logs out
      }
      setLoading(false); // Stop loading after user state is determined
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);

  if (!user) return <div>Please log in to view your shipping information.</div>;

  return (
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
                        idx === index ? { ...item, name: e.target.value } : item
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
                        idx === index ? { ...item, flat: e.target.value } : item
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
                        idx === index ? { ...item, city: e.target.value } : item
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
                <button
                  onClick={() => saveShippingInfo(info, index)}
                  className="save-button"
                >
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
                className="shipping-edit-button1"
                onClick={() => enableEditing(index)}
              >
                Edit
              </button>
            </div>
          )}
        </li>
      ))}
    </motion.div>
  );
}

export default Address;
