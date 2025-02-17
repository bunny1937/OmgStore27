import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "./Components/Sidebar";
import Users from "./Components/Users";
import AddProducts from "../db/AddProduct";
import OrdersDash from "./Components/OrdersDash";
import Categories from "./Components/Categories";
import Analytics from "./Components/Analytics";
import Settings from "./Components/Settings";
import "./AdminLayout.css";

const AdminDashboard = () => {
  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <AdminSidebar />
      </div>

      <div className="admin-content">
        <Routes>
          <Route path="/users" element={<Users />} />
          <Route path="/addproducts" element={<AddProducts />} />
          <Route path="/adminorders" element={<OrdersDash />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/adminanalytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
