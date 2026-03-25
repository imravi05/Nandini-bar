import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  FileText,
  Users,
  History,
  X,
  ShoppingCart,
} from "lucide-react";

import authService from "../../services/auth.service";
import { canAccessRoute } from "../../config/roles";

const Sidebar = ({ isMobile, closeMenu }) => {
  const user = authService.getCurrentUser();
  const userRole = user?.role || "CASHIER";

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Inventory", path: "/inventory", icon: ClipboardList },
    { name: "Sales", path: "/sales", icon: ShoppingCart },
    { name: "Daily Closing", path: "/daily", icon: FileText },
    { name: "Audit Logs", path: "/audit", icon: History },
    // { name: "Staff Management", path: "/users", icon: Users },
  ];

  return (
    <aside
      style={{ backgroundColor: "#222831" }}
      className={`w-full md:w-64 text-white flex flex-col h-full shadow-xl 
      ${isMobile ? "flex" : "hidden md:flex z-20"}
    `}
    >
      {/* Logo / Brand */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl"
            style={{ backgroundColor: "#00ADB5", color: "#fff" }}
          >
            OM
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              OM SAI RAM
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
              Management
            </p>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={closeMenu}
            className="text-slate-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems
          .filter((item) => canAccessRoute(userRole, item.path))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={isMobile ? closeMenu : undefined}
                className={({ isActive }) =>
                  `group flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`
                }
                style={({ isActive }) =>
                  isActive ? { backgroundColor: "#00ADB5" } : {}
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-500 group-hover:text-slate-300 transition-colors"
                      }
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-white/10 mt-auto">
        <div
          className="p-4 rounded-xl relative overflow-hidden"
          style={{ backgroundColor: "#393E46" }}
        >
          <p className="text-sm font-semibold text-white">System Status</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              All systems operational
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
