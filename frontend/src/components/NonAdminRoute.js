import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "./Loader";

const NonAdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  // Allow unauthenticated users to access normal (non-admin) pages.
  // If an authenticated staff user accesses a non-admin page, redirect them to admin UI.
  if (loading) return <Loader label="Checking access..." />;
  if (user?.is_staff) return <Navigate to="/admin-ui" replace />;
  return children;
};

export default NonAdminRoute;
