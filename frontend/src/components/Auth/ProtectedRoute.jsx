import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const ProtectedRoute = ({ children, allowedRoles, redirectTo = "/" }) => {
  const { user, isAuthenticated } = useUser();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
