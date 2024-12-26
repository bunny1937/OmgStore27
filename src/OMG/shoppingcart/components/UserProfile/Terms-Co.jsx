import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../../db/Firebase";
import { motion } from "framer-motion";

const db = getFirestore(firebaseApp);

function TermsCo() {
  const [termsInfo, setTermsInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTermsInfo = async () => {
    try {
      const docRef = doc(db, "Information", "Terms-Conditions");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTermsInfo(docSnap.data());
      } else {
        console.error("No such document found!");
        setTermsInfo(null);
      }
    } catch (error) {
      console.error("Error fetching Terms and Conditions info:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTermsInfo();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="terms-conditions-section"
    >
      <h2>Terms and Conditions</h2>
      {termsInfo ? (
        <div className="terms-grid">
          <p>{termsInfo.Terms}</p>
        </div>
      ) : (
        <p>No Terms and Conditions available.</p>
      )}
    </motion.div>
  );
}

export default TermsCo;
