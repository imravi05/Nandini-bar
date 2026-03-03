import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import authService from "../services/auth.service";
import { canAccessRoute, ROLE_ROUTES, ROLES } from "../config/roles";

/**
 * Ensures a user is authenticated and authorized via central Roles Blueprint.
 */
export default function ProtectedRoutes() {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role || ROLES.CASHIER;

  // Check the Central Blueprint
  if (!canAccessRoute(userRole, location.pathname)) {
    // If not allowed, bounce them to their first allowed page safely
    const fallback = ROLE_ROUTES[userRole]?.[0] || "/login";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
