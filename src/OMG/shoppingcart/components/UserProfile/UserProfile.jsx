import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Profile from "./Profile";
import Order from "./Order";
import Favourites from "./Favourites";
import Address from "./Address";
import ReturnRefund from "./Return-Refund";
import TermsCo from "./Terms-Co";
import ContactUs from "./Contact-Us";
import "./UserProfile1.css";

function UserProfile1() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 760);
  const [showSidebar, setShowSidebar] = useState(true); // Mobile: sidebar starts visible
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 760;
      setIsMobile(mobileView);
      setShowSidebar(mobileView); // Reset sidebar for mobile
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    if (!showSidebar && isMobile) {
      setShowSidebar(true); // Show sidebar when going back
    } else {
      navigate(-1); // Default browser back behavior
    }
  };

  return (
    <div className="user-profile">
      {/* Mobile Breadcrumb */}
      {isMobile && !showSidebar && (
        <div className="breadcrumb">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
          <span>{location.pathname.replace("/UserProfile/", "")}</span>
        </div>
      )}

      {/* Sidebar */}
      {(showSidebar || !isMobile) && (
        <Sidebar setShowSidebar={setShowSidebar} />
      )}

      {/* Content */}
      <div
        className={`content-container ${
          isMobile && showSidebar ? "hide-content" : ""
        }`}
      >
        <Routes>
          <Route path="profile" element={<Profile />} />
          <Route path="order" element={<Order />} />
          <Route path="Favourite" element={<Favourites />} />
          <Route path="address" element={<Address />} />
          <Route path="return-refund" element={<ReturnRefund />} />
          <Route path="terms-co" element={<TermsCo />} />
          <Route path="contact-us" element={<ContactUs />} />
          <Route path="*" element={<h1>Page Not Found</h1>} />
        </Routes>
      </div>
    </div>
  );
}

export default UserProfile1;
