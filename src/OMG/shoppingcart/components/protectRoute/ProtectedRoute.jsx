import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "../../../Auth/UserContext";

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useContext(UserContext);

  if (!user) {
    // Redirect to sign-in if not logged in
    return <Navigate to="/SignIn" />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect to the home page if the user is not an admin
    return <Navigate to="/" />;
  }

  // Render the child components if the user is authorized
  return children;
};
