import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseApp } from "../../db/Firebase";
import "./Category.css";
import LazyImage from "../../admin/Components/LazyLoad";

const Category = () => {
  const [hoveredProducts, setHoveredProducts] = useState({});
  const [products, setProducts] = useState({
    Hoodies: [],
    Tshirts: [],
    Oversize: [],
  });

  // Use separate refs for each slider
  const sliderRefs = {
    Hoodies: useRef(null),
    Tshirts: useRef(null),
    Oversize: useRef(null),
  };

  // Track touch and drag state for each slider separately
  const touchStateRef = useRef({});

  const navigate = useNavigate();
  const firestore = getFirestore(firebaseApp);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Optimized touch handlers with passive option and throttling
  const handleTouchStart = (e, category) => {
    const slider = sliderRefs[category].current;
    if (!slider) return;

    const touch = e.touches[0];

    // Store touch start position and timestamp
    touchStateRef.current[category] = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      scrollLeft: slider.scrollLeft,
      isScrolling: true,
    };
  };

  const handleTouchMove = (e, category) => {
    const touchState = touchStateRef.current[category];
    const slider = sliderRefs[category].current;

    if (!touchState?.isScrolling || !slider) return;

    // Prevent default only if horizontal scrolling detected
    const touch = e.touches[0];
    const deltaX = touchState.startX - touch.clientX;
    const deltaY = touchState.startY - touch.clientY;

    // If more horizontal than vertical movement, prevent default
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    } else {
      // If more vertical, stop tracking this as a horizontal scroll
      touchStateRef.current[category].isScrolling = false;
      return;
    }

    // Calculate momentum based on speed
    const speed = 1.2; // Momentum multiplier
    const movement = deltaX * speed;

    // Apply scroll with momentum
    slider.scrollLeft = touchState.scrollLeft + movement;
  };

  const handleTouchEnd = (category) => {
    const touchState = touchStateRef.current[category];
    const slider = sliderRefs[category].current;

    if (!touchState || !touchState.isScrolling || !slider) return;

    // Calculate momentum based on speed of gesture
    const endTime = Date.now();
    const duration = endTime - touchState.startTime;

    if (duration < 200) {
      // Fast swipe
      const distance = touchState.startX - touchState.lastX;
      const velocity = distance / duration;

      // Apply inertia
      slider.scrollBy({
        left: velocity * 300, // Multiply by factor for "weight" of the scroll
        behavior: "smooth",
      });
    }

    // Reset touch state
    touchStateRef.current[category] = null;
  };

  // Use requestAnimationFrame for smooth button scrolling
  const handleScroll = (category, direction) => {
    const container = sliderRefs[category].current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll =
      container.scrollLeft +
      (direction === "right" ? scrollAmount : -scrollAmount);

    // Use native scrollTo with smooth behavior
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

  // Memoized card renderer to avoid unnecessary re-renders
  const renderProductCard = (product) => {
    const isHovered = hoveredProducts[product.id];
    const imgUrl =
      isHovered && product.ImgUrls && product.ImgUrls[1]
        ? product.ImgUrls[1]
        : product.ImgUrls && product.ImgUrls[0];

    return (
      <div
        key={product.id}
        className="category-card"
        onMouseEnter={() => handleMouseEnter(product.id)}
        onMouseLeave={() => handleMouseLeave(product.id)}
      >
        <Link to={`/Details/${product.id}`}>
          <div className="category-image-container">
            {imgUrl && (
              <LazyImage
                src={imgUrl}
                alt={product.Name || "Product Image"}
                className="category-image"
                loading="lazy"
                width="200"
                height="10"
              />
            )}
          </div>
          <div className="category-info">
            <h3 className="product-name">{product.Name}</h3>
            <p className="product-price">
              ₹ {product.discountedPrice?.toFixed(2) || "0.00"}
            </p>
          </div>
        </Link>
      </div>
    );
  };

  const renderProductSlider = (category, title) => {
    const productList = products[category] || [];

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
            onTouchEnd={() => handleTouchEnd(category)}
          >
            {productList.map(renderProductCard)}
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
