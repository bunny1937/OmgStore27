import React, { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import UserContext from "../Auth/UserContext";
import AdminSidebar from "./Components/Sidebar";
import "./AdminLayout.css";

const AdminDashboard = () => {
  const { isAdmin } = useContext(UserContext);

  if (!isAdmin) {
    return <Navigate to="/SignIn" replace />;
  }
  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <AdminSidebar />
      </div>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
