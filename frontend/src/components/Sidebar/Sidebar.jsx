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
} from "lucide-react";

const Sidebar = ({ isMobile, closeMenu }) => {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Inventory", path: "/inventory", icon: ClipboardList },
    { name: "Daily Closing", path: "/daily", icon: FileText },
    { name: "Audit Logs", path: "/audit", icon: History },
    { name: "Staff Management", path: "/users", icon: Users },
  ];

  return (
    <aside
      className={`w-full md:w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl 
      ${isMobile ? "flex" : "hidden md:flex z-20"}
    `}
    >
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex shadow-lg shadow-indigo-500/30 items-center justify-center font-bold text-xl text-white">
            N
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Nandini Bar
            </h2>
            <p className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider mt-0.5">
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

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={isMobile ? closeMenu : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
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

      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="bg-slate-800/60 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
          <p className="text-sm font-semibold text-slate-200">System Status</p>
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
