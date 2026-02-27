import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/auth.service";

/**
 * Used to wrap pages like Login and Register.
 * If user is already authenticated, redirect them to the dashboard instead of showing login form again
 */
export default function PublicRoutes() {
  const user = authService.getCurrentUser();

  // If already logged in, redirect to main application
  if (user && user.token) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render requested public route
  return <Outlet />;
}
