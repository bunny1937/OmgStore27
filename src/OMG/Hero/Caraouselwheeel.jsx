import React, { useEffect, useRef, useState } from "react";
import "./RollingGallery.css";
import img1 from "./photos/rollingwheel/Awasome (back).png";
import img2 from "./photos/rollingwheel/Big Ganpati navy blue (back).png";
import img3 from "./photos/rollingwheel/Belive edition.png";
import img4 from "./photos/rollingwheel/Colored Baapa White (Back).png";
import img5 from "./photos/rollingwheel/Make Day Epic (back).png";
import img6 from "./photos/rollingwheel/Colored Baapa White (Front).png";
import img7 from "./photos/rollingwheel/Monkey (back).png";
import img8 from "./photos/rollingwheel/navy blue Baapa (Front).png";
import img9 from "./photos/rollingwheel/Old school Edition.png";
import img10 from "./photos/rollingwheel/white Om (back).png";

const Carouselwheeel = () => {
  const [progress, setProgress] = useState(50);
  const [startX, setStartX] = useState(0);
  const [active, setActive] = useState(0);
  const [isDown, setIsDown] = useState(false);

  const itemsRef = useRef([]);
  const cursorsRef = useRef([]);

  const SPEED_WHEEL = 0.02;
  const SPEED_DRAG = -0.1;

  const items = [
    { img: img1 },
    {
      title: "",
      num: "",
      img: img6,
    },
    {
      title: "",
      num: "",
      img: img3,
    },
    { title: "", num: "", img: img4 },
    {
      title: "",
      num: "",
      img: img5,
    },
    { title: "", num: "", img: img2 },
    {
      title: "",
      num: "",
      img: img7,
    },
    {
      title: "",
      num: "",
      img: img8,
    },
    {
      title: "",
      num: "",
      img: img9,
    },
    { title: "", num: "", img: img10 },
  ];

  const getZindex = (array, index) => {
    return array.map((_, i) =>
      index === i ? array.length : array.length - Math.abs(index - i)
    );
  };

  const displayItems = () => {
    const zIndexes = getZindex(items, active);
    itemsRef.current.forEach((item, index) => {
      if (item) {
        item.style.setProperty("--zIndex", zIndexes[index]);
        item.style.setProperty("--active", (index - active) / items.length);
      }
    });
  };

  const animate = () => {
    const newProgress = Math.max(0, Math.min(progress, 100));
    const newActive = Math.floor((newProgress / 100) * (items.length - 1));
    setProgress(newProgress);
    setActive(newActive);
    displayItems();
  };

  const handleWheel = (e) => {
    const wheelProgress = e.deltaY * SPEED_WHEEL;
    setProgress((prev) => prev + wheelProgress);
  };

  const handleMouseMove = (e) => {
    if (e.type === "mousemove") {
      cursorsRef.current.forEach((cursor) => {
        if (cursor) {
          cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        }
      });
    }
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
    setProgress((index / items.length) * 100 + 10);
  };

  useEffect(() => {
    animate();
  }, [progress, active]);

  useEffect(() => {
    document.addEventListener("wheel", handleWheel);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchstart", handleMouseDown);
    document.addEventListener("touchmove", handleMouseMove);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchstart", handleMouseDown);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDown, startX]);

  return (
    <div className="caraousel-box1">
      <div className="carousel">
        {items.map((item, index) => (
          <div
            key={index}
            className="carousel-item"
            ref={(el) => (itemsRef.current[index] = el)}
            onClick={() => handleItemClick(index)}
          >
            <div className="carousel-box">
              <div className="title">{item.title}</div>
              <div className="num">{item.num}</div>
              <img src={item.img} alt={item.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carouselwheeel;
