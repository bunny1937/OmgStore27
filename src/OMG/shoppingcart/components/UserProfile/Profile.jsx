import React from "react";
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "../../../db/Firebase"; // Adjust this path to your Firebase initialization
import { motion } from "framer-motion"; // For animations
import "./Userstyles/Profile.css";
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
function Profile() {
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserDetails(currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);
  if (loading) return <div>Loading...</div>;
  return (
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
          <button onClick={updateUserDetails} className="save-button">
            Save
          </button>
        ) : (
          <button onClick={() => setEditing(true)} className="edit-button">
            Edit
          </button>
        )}
        {editing && (
          <button onClick={() => setEditing(false)} className="cancel-button">
            Cancel
          </button>
        )}
      </div>
    </motion.section>
  );
}

export default Profile;
