import React from "react";
import "./Skeleton.css";

const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton skeleton-title-price">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-price"></div>
      </div>
      <div className="skeleton skeleton-category"></div>
    </div>
  );
};

export default SkeletonCard;
