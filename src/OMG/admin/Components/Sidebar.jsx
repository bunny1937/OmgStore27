import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css"; // Plain CSS for styling

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <nav>
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/users"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Users
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/addproducts"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Add Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/adminorders"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/categories"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Categories
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/adminanalytics"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Analytics
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
