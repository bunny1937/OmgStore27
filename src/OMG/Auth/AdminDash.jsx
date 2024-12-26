import React, { useContext } from "react";
import UserContext from "./UserContext";
import AddProducts from "../db/AddProduct";

function AdminDash() {
  const { isAdmin } = useContext(UserContext);

  if (!isAdmin) {
    return <p>You are not an admin.</p>;
  }

  return (
    <div>
      <h1>Hello Admin</h1>
      <AddProducts />
    </div>
  );
}

export default AdminDash;
