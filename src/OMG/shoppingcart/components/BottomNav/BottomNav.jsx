// // components/BottomNav/BottomNav.jsx
// import React, { useState } from "react";
// import {
//   Home,
//   ShoppingBag,
//   ShoppingCart,
//   User,
//   LogOut,
//   Package,
//   RefreshCcw,
//   MapPin,
//   CreditCard,
// } from "lucide-react";
// import "./BottomNav.css";

// const BottomNav = () => {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("home");

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//     if (tab === "profile") {
//       setIsProfileOpen(!isProfileOpen);
//     } else {
//       setIsProfileOpen(false);
//     }
//   };

//   return (
//     <div className="nav-container">
//       {isProfileOpen && (
//         <div className="profile-drawer">
//           <div className="profile-header">
//             <div className="profile-avatar">
//               <User />
//             </div>
//             <div className="profile-info">
//               <h3>User Profile</h3>
//               <p>example@email.com</p>
//             </div>
//           </div>

//           <nav className="profile-nav">
//             <a href="/orders" className="profile-link">
//               <Package />
//               <span>Orders</span>
//             </a>
//             <a href="/refunds" className="profile-link">
//               <RefreshCcw />
//               <span>Refunds</span>
//             </a>
//             <a href="/addresses" className="profile-link">
//               <MapPin />
//               <span>Addresses</span>
//             </a>
//             <a href="/payments" className="profile-link">
//               <CreditCard />
//               <span>Payments</span>
//             </a>
//             <a href="/logout" className="profile-link">
//               <LogOut />
//               <span>Logout</span>
//             </a>
//           </nav>
//         </div>
//       )}

//       <nav className="bottom-nav">
//         <button
//           className={`nav-item ${activeTab === "home" ? "active" : ""}`}
//           onClick={() => handleTabClick("home")}
//         >
//           <Home />
//           <span>Homeeeeeeeeeeee</span>
//         </button>

//         <button
//           className={`nav-item ${activeTab === "products" ? "active" : ""}`}
//           onClick={() => handleTabClick("products")}
//         >
//           <ShoppingBag />
//           <span>Products</span>
//         </button>

//         <button
//           className={`nav-item ${activeTab === "cart" ? "active" : ""}`}
//           onClick={() => handleTabClick("cart")}
//         >
//           <ShoppingCart />
//           <span>Cart</span>
//         </button>

//         <button
//           className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
//           onClick={() => handleTabClick("profile")}
//         >
//           <User />
//           <span>Profile</span>
//         </button>
//       </nav>
//     </div>
//   );
// };

// export default BottomNav;
