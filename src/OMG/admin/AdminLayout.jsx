import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "./Components/Sidebar";
import Dashboard from "./Components/Dashboard";
import Users from "./Components/Users";
import Categories from "./Components/Categories";
// import Discounts from "./Components/Discounts";
import Analytics from "./Components/Analytics";
import Settings from "./Components/Settings";
import AddProducts from "../db/AddProduct";
import OrdersDash from "./Components/OrdersDash";

// import "./admin.css"; // Plain CSS for styling

const AdminDashboard = () => {
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="admin-content">
        <Routes>
          {/* <Route path="/" element={<Dashboard />} /> */}
          <Route path="/users" element={<Users />} />
          <Route path="/addproducts" element={<AddProducts />} />
          <Route path="/adminorders" element={<OrdersDash />} />
          <Route path="/categories" element={<Categories />} />
          {/* <Route path="/discounts" element={<Discounts />} /> */}
          <Route path="/adminanalytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          {/* <Route path="/customer-support" element={<CustomerSupport />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
