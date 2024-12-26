import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../../db/Firebase";
import { motion } from "framer-motion";

const db = getFirestore(firebaseApp);

function ContactUs() {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch contact info from Firestore
  const fetchContactInfo = async () => {
    try {
      const docRef = doc(db, "Information", "Contact-Us");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setContactInfo(docSnap.data());
      } else {
        console.error("No such document found!");
        setContactInfo(null);
      }
    } catch (error) {
      console.error("Error fetching contact info:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="contact-us-section"
    >
      <h2>Contact Us</h2>
      {contactInfo ? (
        <div className="contact-info-grid">
          <p>
            <strong>Name:</strong> {contactInfo.name}
          </p>
          <p>
            <strong>Phone Number:</strong> {contactInfo.number}
          </p>
        </div>
      ) : (
        <p>No contact information available.</p>
      )}
    </motion.div>
  );
}

export default ContactUs;
