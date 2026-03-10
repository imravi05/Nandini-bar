import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, User } from "lucide-react";
import authService from "../../services/auth.service";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header
      className="text-white shadow-sm flex justify-between items-center px-4 md:px-6 py-4 z-10 sticky top-0"
      style={{ backgroundColor: "#393E46" }}
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-300 hover:bg-white/10 rounded-lg transition"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-bold text-white hidden sm:block">
          Welcome back, {user?.name?.split(" ")[0] || "User"}!
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="h-8 w-[1px] bg-white/20 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none mb-1">
              {user?.name || "Employee"}
            </p>
            <p
              className="text-[10px] font-bold tracking-wider uppercase rounded-full px-2 py-0.5 inline-block"
              style={{ backgroundColor: "#00ADB5", color: "#fff" }}
            >
              {user?.role === "INVENTORY"
                ? "INVENTORY MANAGER"
                : user?.role || "USER"}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex justify-center items-center text-white shadow-md border-2 border-white/20 shrink-0"
            style={{ backgroundColor: "#00ADB5" }}
          >
            <User size={20} />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-all hover:shadow-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
