import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseApp } from "../../db/Firebase";
import "./Category.css";

const Category = () => {
  const [hoveredProducts, setHoveredProducts] = useState({});
  const [products, setProducts] = useState({
    Hoodies: [],
    Tshirts: [],
    Oversize: [],
  });

  const sliderRefs = {
    Hoodies: useRef(null),
    Tshirts: useRef(null),
    Oversize: useRef(null),
  };

  // Simplified touch tracking
  const touchRef = useRef({
    startX: 0,
    scrollLeft: 0,
  });

  const navigate = useNavigate();
  const firestore = getFirestore(firebaseApp);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(firestore, "Products"));
      const allProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts({
        Hoodies: allProducts.filter(
          (product) => product.Category === "Hoodies"
        ),
        Tshirts: allProducts.filter(
          (product) => product.Category === "Tshirts"
        ),
        Oversize: allProducts.filter(
          (product) => product.Category === "Oversize"
        ),
      });
    };

    fetchProducts();
  }, [firestore]);

  const handleTouchStart = (e, category) => {
    const touch = e.touches[0];
    const slider = sliderRefs[category].current;

    touchRef.current = {
      startX: touch.clientX,
      scrollLeft: slider.scrollLeft,
    };
  };

  const handleTouchMove = (e, category) => {
    const touch = e.touches[0];
    const slider = sliderRefs[category].current;

    if (!touchRef.current.startX) return;

    const x = touch.clientX;
    const walk = (touchRef.current.startX - x) * 1.5; // Multiply by 1.5 for faster scrolling

    slider.scrollLeft = touchRef.current.scrollLeft + walk;
  };

  const handleTouchEnd = () => {
    touchRef.current = {
      startX: 0,
      scrollLeft: 0,
    };
  };

  const handleScroll = (category, direction) => {
    const container = sliderRefs[category].current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll =
      container.scrollLeft +
      (direction === "right" ? scrollAmount : -scrollAmount);

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const handleSeeAll = (category) => {
    navigate(`/category/${category}`);
  };

  const handleMouseEnter = (productId) => {
    setHoveredProducts((prev) => ({ ...prev, [productId]: true }));
  };

  const handleMouseLeave = (productId) => {
    setHoveredProducts((prev) => ({ ...prev, [productId]: false }));
  };

  const renderProductSlider = (category, title) => {
    return (
      <div className="category-slider-container">
        <div className="category-slider-header">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={() => handleSeeAll(category)}
            className="see-all-button"
          >
            See All
          </button>
        </div>
        <div className="category-slider-wrapper">
          <button
            className="scroll-button scroll-button-left"
            onClick={() => handleScroll(category, "left")}
            aria-label="Scroll left"
          >
            {"<"}
          </button>
          <div
            className="category-slider"
            ref={sliderRefs[category]}
            onTouchStart={(e) => handleTouchStart(e, category)}
            onTouchMove={(e) => handleTouchMove(e, category)}
            onTouchEnd={handleTouchEnd}
          >
            {products[category].map((product) => (
              <div
                key={product.id}
                className="category-card"
                onMouseEnter={() => handleMouseEnter(product.id)}
                onMouseLeave={() => handleMouseLeave(product.id)}
              >
                <Link to={`/Details/${product.id}`}>
                  <div className="category-image-container">
                    {product.ImgUrls && product.ImgUrls.length > 0 && (
                      <img
                        src={
                          hoveredProducts[product.id] && product.ImgUrls[1]
                            ? product.ImgUrls[1]
                            : product.ImgUrls[0]
                        }
                        alt={product.Name || "Product Image"}
                        className="category-image"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="category-info">
                    <h3 className="product-name">{product.Name}</h3>
                    <p className="product-price">
                      ₹ {product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <button
            className="scroll-button scroll-button-right"
            onClick={() => handleScroll(category, "right")}
            aria-label="Scroll right"
          >
            {">"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="horizontal-category-slider">
      {renderProductSlider("Hoodies", "Hoodies")}
      {renderProductSlider("Tshirts", "T-Shirts")}
      {renderProductSlider("Oversize", "Oversized")}
    </div>
  );
};

export default Category;
