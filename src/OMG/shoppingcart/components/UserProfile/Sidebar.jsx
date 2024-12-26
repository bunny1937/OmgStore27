import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ setShowSidebar }) {
  const handleMenuClick = () => {
    if (setShowSidebar) setShowSidebar(false); // Close sidebar on mobile
  };

  return (
    <div className="sidebar">
      <Link to="profile" className="menu-item" onClick={handleMenuClick}>
        Profile
      </Link>
      <Link to="order" className="menu-item" onClick={handleMenuClick}>
        Orders
      </Link>
      <Link to="Favourite" className="menu-item" onClick={handleMenuClick}>
        Favourites
      </Link>
      <Link to="address" className="menu-item" onClick={handleMenuClick}>
        Address
      </Link>
      <Link to="return-refund" className="menu-item" onClick={handleMenuClick}>
        Return & Refund
      </Link>
      <Link to="terms-co" className="menu-item" onClick={handleMenuClick}>
        Terms & Conditions
      </Link>
      <Link to="contact-us" className="menu-item" onClick={handleMenuClick}>
        Contact Us
      </Link>
    </div>
  );
}

export default Sidebar;
