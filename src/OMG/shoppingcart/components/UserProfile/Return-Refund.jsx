import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../../db/Firebase";
import { motion } from "framer-motion";

const db = getFirestore(firebaseApp);

function ReturnRefund() {
  const [returnRefundInfo, setReturnRefundInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReturnRefundInfo = async () => {
    try {
      const docRef = doc(db, "Information", "Refund-Return");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setReturnRefundInfo(docSnap.data());
      } else {
        console.error("No such document found!");
        setReturnRefundInfo(null);
      }
    } catch (error) {
      console.error("Error fetching Return/Refund info:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRefundInfo();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="return-refund-section"
    >
      <h2>Return & Refund Policy</h2>
      {returnRefundInfo ? (
        <div className="policy-grid">
          <p>
            <strong>Return Policy:</strong> {returnRefundInfo.Return}
          </p>
          <p>
            <strong>Refund Policy:</strong> {returnRefundInfo.Refund}
          </p>
        </div>
      ) : (
        <p>No Return/Refund policy available.</p>
      )}
    </motion.div>
  );
}

export default ReturnRefund;
