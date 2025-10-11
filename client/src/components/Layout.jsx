import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gray-50">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden pt-16">
        {/* Outlet content */}
        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
