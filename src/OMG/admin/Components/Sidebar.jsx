import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css"; // Plain CSS for styling

const AdminSidebar = () => {
  return (
    <div className="adminsidebar">
      <h2 className="adminsidebar-title">Admin Panel</h2>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Users
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/addproducts"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Add Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/adminorders"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Categories
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/adminanalytics"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Analytics
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Settings
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/p-o-d"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Print on Demand
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/featuredproduct"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Featured Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/bestselling"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Best Selling
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
