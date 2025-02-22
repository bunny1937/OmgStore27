import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseApp } from "../db/Firebase";
import "./RollingGallery.css";
const Carouselwheeel = () => {
  const [products, setProducts] = useState([]);
  const [progress, setProgress] = useState(50);
  const [startX, setStartX] = useState(0);
  const [active, setActive] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const itemsRef = useRef([]);
  const firestore = getFirestore(firebaseApp);

  const SPEED_WHEEL = 0.02;
  const SPEED_DRAG = -0.1;

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [firestore]);

  const getZindex = (array, index) => {
    return array.map((_, i) =>
      index === i ? array.length : array.length - Math.abs(index - i)
    );
  };

  const displayItems = () => {
    const zIndexes = getZindex(products, active);
    itemsRef.current.forEach((item, index) => {
      if (item) {
        item.style.setProperty("--zIndex", zIndexes[index]);
        item.style.setProperty("--active", (index - active) / products.length);
      }
    });
  };

  const animate = () => {
    const newProgress = Math.max(0, Math.min(progress, 100));
    const newActive = Math.floor((newProgress / 100) * (products.length - 1));
    setProgress(newProgress);
    setActive(newActive);
    displayItems();
  };

  const handleWheel = (e) => {
    const wheelProgress = e.deltaY * SPEED_WHEEL;
    setProgress((prev) => prev + wheelProgress);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const mouseProgress = (x - startX) * SPEED_DRAG;
    setProgress((prev) => prev + mouseProgress);
    setStartX(x);
  };

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.clientX || (e.touches && e.touches[0].clientX) || 0);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleItemClick = (index) => {
    setProgress((index / products.length) * 100 + 10);
  };
  const preventDragHandler = (e) => {
    e.preventDefault();
    return false;
  };
  useEffect(() => {
    animate();
  }, [progress, active]);

  useEffect(() => {
    const carousel = document.querySelector(".carousel");
    if (carousel) {
      carousel.addEventListener("dragstart", preventDragHandler);
      carousel.addEventListener("drop", preventDragHandler);
    }
    document.addEventListener("wheel", handleWheel);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchstart", handleMouseDown);
    document.addEventListener("touchmove", handleMouseMove);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      if (carousel) {
        carousel.removeEventListener("dragstart", preventDragHandler);
        carousel.removeEventListener("drop", preventDragHandler);
      }
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchstart", handleMouseDown);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDown, startX]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="caraousel-box1">
      <div className="carousel">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="carousel-item"
            ref={(el) => (itemsRef.current[index] = el)}
            onClick={() => handleItemClick(index)}
          >
            <Link to={`/Details/${product.id}`}>
              <div className="carousel-box">
                <img
                  src={product.ImgUrls[0]} // Using the first image from ImgUrls array
                  alt="Product"
                  draggable="false" // Prevent image dragging
                  onDragStart={preventDragHandler}
                  style={{ userSelect: "none" }}
                  onError={(e) => {
                    e.target.src = "path/to/fallback/image.jpg"; // Add a fallback image path
                    console.error("Error loading image:", product.ImgUrls[0]);
                  }}
                />
                {/* <div className="title">{product.Name}</div> 
                <div className="category">{product.Category}</div>
                <div className="gender">{product.Gender}</div> */}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carouselwheeel;
