import React, { useState, useEffect } from "react";
import "./Mainpage.css";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../db/Firebase";
import LazyImage from "../admin/Components/LazyLoad";

const fadeInBottom = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeInTop = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Mainpage = () => {
  const navigate = useNavigate();
  const [minimalistProducts, setMinimalistProducts] = useState([]);
  const [spiritualProducts, setSpiritualProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Specify the exact product IDs you want to display
  // Adjust these IDs based on your actual product IDs in Firestore
  const minimalistProductIds = ["1", "21"]; // Replace with your chosen minimalist product IDs
  const spiritualProductIds = ["12", "10"]; // Replace with your chosen spiritual product IDs

  useEffect(() => {
    const fetchSpecificProducts = async () => {
      try {
        // Fetch minimalist products by ID
        const minimalistPromises = minimalistProductIds.map((id) =>
          getDoc(doc(db, "Products", id))
        );

        // Fetch spiritual products by ID
        const spiritualPromises = spiritualProductIds.map((id) =>
          getDoc(doc(db, "Products", id))
        );

        // Wait for all fetches to complete
        const [minimalistResults, spiritualResults] = await Promise.all([
          Promise.all(minimalistPromises),
          Promise.all(spiritualPromises),
        ]);

        // Process results
        const minimalistItems = minimalistResults
          .filter((docSnap) => docSnap.exists())
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

        const spiritualItems = spiritualResults
          .filter((docSnap) => docSnap.exists())
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

        setMinimalistProducts(minimalistItems);
        setSpiritualProducts(spiritualItems);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching specific products:", error);
        setLoading(false);
      }
    };

    fetchSpecificProducts();
  }, []);

  // Fallback component while loading
  if (loading) {
    return <div className="loading">Loading featured products...</div>;
  }

  return (
    <div className="landing-container">
      <motion.div
        className="landing-partition aesthetic"
        initial="initial"
        animate="animate"
      >
        <div className="landing-content">
          <motion.div
            className="landing-image-container"
            variants={fadeInBottom}
          >
            {minimalistProducts.map((product) => (
              <Link to={`/Details/${product.id}`}>
                <LazyImage
                  key={product.id}
                  src={product.ImgUrls[1]}
                  alt={product.Name}
                  className="landing-image"
                />
              </Link>
            ))}
          </motion.div>
          <p className="landing-description">
            Elevate your space with our curated collection of minimalist
            designs.
          </p>
        </div>
        <h1
          className="landing-title aesthetic-title"
          onClick={() => navigate("/products/Minimalist")}
          style={{ cursor: "pointer" }}
        >
          Minimalist
        </h1>
      </motion.div>
      <motion.div
        className="landing-partition spiritual"
        initial="initial"
        animate="animate"
      >
        <h1
          className="landing-title spiritual-title"
          onClick={() => navigate("/products/Spiritual")}
          style={{ cursor: "pointer" }}
        >
          Divine
        </h1>
        <motion.div className="landing-content2" variants={fadeInTop}>
          <p className="landing-description2">
            Discover tranquility, faith and inner peace through our spiritual
            treasures.
          </p>
          <div className="landing-image-container">
            {spiritualProducts.map((product) => (
              <Link to={`/Details/${product.id}`}>
                <LazyImage
                  key={product.id}
                  src={product.ImgUrls[1]}
                  alt={product.Name}
                  className="landing-image"
                />
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Mainpage;
