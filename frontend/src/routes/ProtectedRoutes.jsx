import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/auth.service";

/**
 * Ensures a user is authenticated.
 * If no user exists in local storage, redirects them out to /login
 */
export default function ProtectedRoutes({ allowedRoles }) {
  const user = authService.getCurrentUser();

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Add Role Checking Logic based on `allowedRoles` array
  if (allowedRoles && user.user && !allowedRoles.includes(user.user.role)) {
    // If user's role doesn't match, send back to home/dashboard or show unauthorized
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
