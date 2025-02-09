import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "../../../db/Firebase";
import { motion } from "framer-motion";

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

function Payment() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setPaymentMethods(userDoc.data().paymentMethods || []);
          }
        } catch (error) {
          console.error("Error fetching payment methods:", error);
        }
      }
      setLoading(false);
    };

    fetchPaymentMethods();
  }, []);

  const removePaymentMethod = async (index) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const updatedMethods = [...paymentMethods];
      updatedMethods.splice(index, 1);
      await updateDoc(doc(db, "users", user.uid), {
        paymentMethods: updatedMethods,
      });
      setPaymentMethods(updatedMethods);
    } catch (error) {
      console.error("Error removing payment method:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <motion.section
      className="payment-card"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h2>Saved Payment Methods</h2>
      {paymentMethods.length > 0 ? (
        <ul>
          {paymentMethods.map((method, index) => (
            <li key={index}>
              {method.cardType} - **** {method.last4}
              <button onClick={() => removePaymentMethod(index)}>Remove</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No saved payment methods.</p>
      )}
    </motion.section>
  );
}

export default Payment;
