import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden font-sans">
      {/* SIDEBAR COMPONENT (Desktop) */}
      <Sidebar isMobile={false} />

      {/* MOBILE FULL SCREEN MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay mask */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <div className="relative w-72 max-w-sm bg-slate-900 h-full shadow-2xl flex-col flex overflow-y-auto animate-in slide-in-from-left z-50 border-r border-slate-800">
            <Sidebar
              isMobile={true}
              closeMenu={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* TOP NAVBAR COMPONENT */}
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 relative p-4 lg:p-8">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10"></div>

          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
