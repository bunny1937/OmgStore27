import React, { useContext } from "react";
import UserContext from "./UserContext";
import AddProducts from "../db/AddProduct";
import AdminDashboard from "../admin/AdminLayout";
import AdminSidebar from "../admin/Components/Sidebar";

function AdminDash1() {
  const { isAdmin } = useContext(UserContext);

  if (!isAdmin) {
    return <p>You are not an admin.</p>;
  }

  return (
    <div>
      <h1>Hello Admin</h1>
      <AdminSidebar />
    </div>
  );
}

export default AdminDash1;
