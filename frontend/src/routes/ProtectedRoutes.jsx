import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import authService from "../services/auth.service";
import { canAccessRoute, ROLE_ROUTES, normalizeRole } from "../config/roles";

/**
 * Ensures a user is authenticated and authorized via central Roles Blueprint.
 */
export default function ProtectedRoutes() {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user.role);

  // Check the Central Blueprint
  if (!canAccessRoute(userRole, location.pathname)) {
    // If they can't access this URL, bounce them safely to their FIRST allowed URL
    const fallback = ROLE_ROUTES[userRole]?.[0] || "/login";

    // Stop recursive redirects
    if (location.pathname === fallback) {
      return <Outlet />;
    }

    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
