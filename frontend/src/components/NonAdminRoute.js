import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "./Loader";

const NonAdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) return <Loader label="Checking access..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.is_staff) return <Navigate to="/admin" replace />;
  return children;
};

export default NonAdminRoute;
