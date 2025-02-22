import React, { useState } from "react";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  getAuth,
} from "firebase/auth";
import { firebaseApp } from "../../../db/Firebase";
import "./Userstyles/Profile.css";
import { motion } from "framer-motion";

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth(firebaseApp);

  const handleChangePassword = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      alert("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      alert("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      alert(error.message);
    }
    setLoading(false);
  };
  return (
    <motion.section
      className="profile-card"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="password-change">
        <h2>Change Password</h2>
        <label>
          Current Password:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input"
          />
        </label>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input"
          />
        </label>
        <button
          onClick={handleChangePassword}
          className="save-button"
          disabled={loading}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </div>
    </motion.section>
  );
}

export default ChangePassword;
