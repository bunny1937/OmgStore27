import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { firebaseApp } from "../../db/Firebase";
import "./FeaturedProduct.css";

const BestSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const firestore = getFirestore(firebaseApp);

  // Fetch all products and best selling configuration
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch all products
        const querySnapshot = await getDocs(collection(firestore, "Products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        setFilteredProducts(productsData);

        // Fetch best selling products configuration
        const bestSellingConfigRef = doc(
          firestore,
          "Configuration",
          "bestSellingProducts"
        );
        const bestSellingConfigSnap = await getDoc(bestSellingConfigRef);

        if (bestSellingConfigSnap.exists()) {
          const bestSellingIds = bestSellingConfigSnap.data().order || [];

          // Map best selling IDs to product objects
          const bestSellingItems = bestSellingIds
            .map((id) => productsData.find((p) => p.id === id))
            .filter(Boolean); // Remove any undefined items

          setBestSellingProducts(bestSellingItems);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [firestore]);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.Name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Save the best selling products order
  const saveBestSellingProducts = async () => {
    try {
      setIsSaving(true);
      setSaveMessage("");

      // Extract just the IDs in order
      const bestSellingIds = bestSellingProducts.map((product) => product.id);

      // Save to Firestore
      const bestSellingConfigRef = doc(
        firestore,
        "Configuration",
        "bestSellingProducts"
      );
      await setDoc(
        bestSellingConfigRef,
        { order: bestSellingIds },
        { merge: true }
      );

      setSaveMessage("Best selling products saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving best selling products:", error);
      setSaveMessage("Error saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a product to best selling list
  const addToBestSelling = (product) => {
    if (!bestSellingProducts.some((p) => p.id === product.id)) {
      setBestSellingProducts([...bestSellingProducts, product]);
    }
  };

  // Remove a product from best selling list
  const removeFromBestSelling = (productId) => {
    setBestSellingProducts(
      bestSellingProducts.filter((p) => p.id !== productId)
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    // For better UX on some browsers
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", e.target);
      e.target.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e) => {
    if (e.target) {
      e.target.style.opacity = "1";
    }
    setDraggedItem(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    return false;
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    // Reorder the list
    const newList = [...bestSellingProducts];
    const draggedItemContent = newList[draggedItem];
    newList.splice(draggedItem, 1);
    newList.splice(index, 0, draggedItemContent);

    setBestSellingProducts(newList);
    setDraggedItem(index);
  };

  // Backup arrow movement functions
  const moveUp = (index) => {
    if (index > 0) {
      const newList = [...bestSellingProducts];
      [newList[index], newList[index - 1]] = [
        newList[index - 1],
        newList[index],
      ];
      setBestSellingProducts(newList);
    }
  };

  const moveDown = (index) => {
    if (index < bestSellingProducts.length - 1) {
      const newList = [...bestSellingProducts];
      [newList[index], newList[index + 1]] = [
        newList[index + 1],
        newList[index],
      ];
      setBestSellingProducts(newList);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading products...</div>;
  }

  return (
    <div className="featured-products">
      <h1 className="admin-title">Best Selling Products Manager</h1>
      {/* Best selling products section */}
      <div className="admin-panel">
        <div className="panel-content">
          <h2 className="panel-title">Best Selling Products</h2>
          <p className="panel-description">
            Drag and drop to reorder items. These products will appear first in
            the best selling sort.
          </p>

          {bestSellingProducts.length === 0 ? (
            <div className="empty-featured">
              No best selling products selected
            </div>
          ) : (
            <ul className="featured-list">
              {bestSellingProducts.map((product, index) => (
                <li
                  key={product.id}
                  className="featured-item"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                >
                  <span className="item-order">{index + 1}</span>
                  <div className="item-details">
                    <img
                      className="featured-img"
                      src={product.ImgUrls[0]}
                      alt={product.Name}
                      draggable={false}
                    />
                    <div className="item-details-text">
                      <div className="item-name">
                        {product.id}-{product.Name || `Product #${product.id}`}
                      </div>
                      <h5 className="item-category">{product.Category}</h5>

                      <div className="item-price">
                        ₹{product.discountedPrice}
                      </div>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="action-button up-button"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === bestSellingProducts.length - 1}
                      className="action-button down-button"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeFromBestSelling(product.id)}
                      className="action-button remove-button"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="save-container">
            <button
              onClick={saveBestSellingProducts}
              disabled={isSaving}
              className="save-button"
            >
              {isSaving ? "Saving..." : "Save Best Selling Order"}
            </button>
            {saveMessage && <div className="save-message">{saveMessage}</div>}
          </div>
        </div>
      </div>

      {/* All products section */}
      <div className="admin-panel">
        <div className="panel-content">
          <h2 className="panel-title">All Products</h2>
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <div className="products-container">
            <ul className="product-list">
              {filteredProducts.map((product) => (
                <li key={product.id} className="product-item">
                  <div className="product-details">
                    <img
                      className="featured-img"
                      src={product.ImgUrls[0]}
                      alt={product.Name}
                    />
                    <div className="product-details-text">
                      <div className="product-name">
                        {product.id}-{product.Name || `Product #${product.id}`}
                      </div>
                      <div className="product-info">
                        ₹{product.discountedPrice} • {product.Category}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addToBestSelling(product)}
                    disabled={bestSellingProducts.some(
                      (p) => p.id === product.id
                    )}
                    className="add-button"
                  >
                    {bestSellingProducts.some((p) => p.id === product.id)
                      ? "Added"
                      : "Add"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestSellingProducts;
