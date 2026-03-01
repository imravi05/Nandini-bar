import React from "react";
import { Routes, Route } from "react-router-dom";

// Route Wrappers
import PublicRoutes from "./PublicRoutes";
import ProtectedRoutes from "./ProtectedRoutes";

// Layouts
import Layout from "../layout/layout";

// Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import Products from "../pages/Products";
import InventoryPage from "../pages/Inventory/InventoryPage";
import SalesPage from "../pages/Sales/SalesPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* -------------------- */}
      {/* PUBLIC PATHS */}
      {/* -------------------- */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* -------------------- */}
      {/* SECURE/PROTECTED PATHS */}
      {/* -------------------- */}
      <Route element={<ProtectedRoutes />}>
        <Route element={<Layout />}>
          {/* Main Dashboard / Home Screen */}
          <Route
            path="/"
            element={
              <div className="p-8">
                <h1 className="text-2xl font-bold">Dashboard Coming Soon...</h1>
              </div>
            }
          />

          {/* You can add more secure pages here down the line 👇 */}
          {/* <Route path="/pos" element={<POS />} /> */}
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/sales" element={<SalesPage />} />
        </Route>
      </Route>

      {/* Fallback Catch-All Route */}
      <Route
        path="*"
        element={
          <div className="p-10 font-bold text-center">404 - Page Not Found</div>
        }
      />
    </Routes>
  );
}
