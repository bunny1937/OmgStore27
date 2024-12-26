import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseApp } from "../../db/Firebase";
import "./Category.css";

const Category = () => {
  const [hoveredProducts, setHoveredProducts] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRefs = {
    Hoodies: useRef(null),
    Tshirts: useRef(null),
    Oversize: useRef(null),
  };

  const [products, setProducts] = useState({
    Hoodies: [],
    Tshirts: [],
    Oversize: [],
  });
  // Track touch and scroll position
  const touchRef = useRef({
    startX: 0,
    scrollLeft: 0,
    isScrolling: false,
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

  const handleMouseDown = (e, category) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRefs[category].current.offsetLeft);
    setScrollLeft(sliderRefs[category].current.scrollLeft);
  };

  const handleMouseMove = (e, category) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRefs[category].current.offsetLeft;
    const scroll = scrollLeft - (x - startX);
    sliderRefs[category].current.scrollLeft = scroll;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e, category) => {
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      scrollLeft: sliderRefs[category].current.scrollLeft,
      isScrolling: true,
    };
  };

  const handleTouchMove = (e, category) => {
    if (!touchRef.current.isScrolling) return;

    e.preventDefault();
    const touch = e.touches[0];
    const delta = touchRef.current.startX - touch.clientX;

    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      if (sliderRefs[category].current) {
        sliderRefs[category].current.scrollLeft =
          touchRef.current.scrollLeft + delta;
      }
    });
  };

  const handleTouchEnd = () => {
    touchRef.current.isScrolling = false;
  };

  const handleScroll = (category, direction) => {
    const container = sliderRefs[category].current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll =
      container.scrollLeft +
      (direction === "right" ? scrollAmount : -scrollAmount);

    // Smooth scroll with native behavior
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
            onMouseDown={(e) => handleMouseDown(e, category)}
            onMouseMove={(e) => handleMouseMove(e, category)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
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
