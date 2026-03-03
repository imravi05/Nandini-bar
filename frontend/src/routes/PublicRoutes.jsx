import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/auth.service";
import { ROLE_ROUTES, normalizeRole } from "../config/roles";

/**
 * Used to wrap pages like Login and Register.
 * If user is already authenticated, redirect them to the dashboard instead of showing login form again
 */
export default function PublicRoutes() {
  const user = authService.getCurrentUser();

  // If already logged in, redirect to main application
  if (user && user.token) {
    const validRole = normalizeRole(user.role);
    const fallback = ROLE_ROUTES[validRole]?.[0] || "/";
    return <Navigate to={fallback} replace />;
  }

  // Otherwise, render requested public route
  return <Outlet />;
}
