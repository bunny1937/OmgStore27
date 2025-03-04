import React from "react";
import "./Skeleton.css";

// Product Card Skeleton
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

// Details Page Skeleton
const DetailsSkeleton = () => {
  return (
    <div className="details">
      <div className="details-container">
        {/* Image Section Skeleton */}
        <div className=" skeleton img-section">
          <div className="skeleton thumbnails">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="skeleton thumbnail skeleton-thumbnail"
              ></div>
            ))}
          </div>
          <div className="skeleton main-image">
            <div className="skeleton-main-image"></div>
          </div>
        </div>

        {/* Details Section Skeleton */}
        <div className="details-section">
          <div className="details-actions">
            <div className="skeleton skeleton-details-title"></div>
            <div className="skeleton skeleton-details-subtitle"></div>
            <div className="skeleton skeleton-details-price"></div>
          </div>

          {/* Features Skeleton */}
          <div className="feature-container">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton skeleton-feature"></div>
            ))}
          </div>

          {/* Size Selection Skeleton */}
          <div className="size-box">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton skeleton-size"></div>
            ))}
          </div>

          {/* Quantity Skeleton */}
          <div className="quantity">
            <div className="skeleton skeleton-button"></div>
            <div className="skeleton skeleton-quantity-value"></div>
            <div className="skeleton skeleton-button"></div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="cart-fav-box">
            <div className="skeleton skeleton-add-btn"></div>
            <div className="skeleton skeleton-fav-btn"></div>
          </div>
          <div className="skeleton skeleton-checkout-btn"></div>

          {/* Accordion Details Skeleton */}
          <div className="description-box">
            {[1, 2, 3].map((i) => (
              <div key={i} className="details-accordion">
                <div className="accordion-header">
                  <div className="skeleton skeleton-accordion-title"></div>
                  <div className="skeleton skeleton-accordion-icon"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Review Section Skeleton
const ReviewSkeleton = () => {
  return (
    <div className="reviews-section skeleton-reviews-section">
      {/* Reviews List Section */}
      <div className="reviews-list">
        <div className="skeleton skeleton-title"></div>

        {/* Multiple Review Items */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="review-item skeleton-review-item">
            <div className="review-data">
              <div className="skeleton skeleton-reviewer-name"></div>
              <div className="review-rating">
                <div className="skeleton skeleton-stars"></div>
              </div>
              <div className="review-info">
                <div className="skeleton skeleton-review-photo"></div>
                <div className="skeleton skeleton-review-text"></div>
              </div>
            </div>
            <div className="skeleton skeleton-review-date"></div>
          </div>
        ))}
      </div>

      {/* Add Review Section */}
      <div className="add-review">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-textarea"></div>
        <div className="photo-box">
          <div className="skeleton skeleton-file-input"></div>
        </div>
        <div className="rating-input">
          <div className="skeleton skeleton-rating-label"></div>
          <div className="stars-input">
            <div className="skeleton skeleton-stars"></div>
          </div>
        </div>
        <div className="skeleton skeleton-submit-button"></div>
      </div>
    </div>
  );
};

// Export individual components as named exports
export { SkeletonCard as default, DetailsSkeleton, ReviewSkeleton };
