import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, User, Bell } from "lucide-react";
import authService from "../../services/auth.service";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser()?.user;

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="bg-white text-slate-800 shadow-sm border-b border-gray-100 flex justify-between items-center px-4 md:px-6 py-4 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent hidden sm:block">
          Welcome back, {user?.name?.split(" ")[0] || "User"}!
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50 hidden sm:block">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none mb-1">
              {user?.name || "Employee"}
            </p>
            <p className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 rounded-full px-2 py-0.5 inline-block">
              {user?.role || "USER"}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex justify-center items-center text-white shadow-md border-2 border-white shrink-0">
            <User size={20} />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:shadow-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
