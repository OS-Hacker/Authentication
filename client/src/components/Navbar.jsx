import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { DropdownMenuRadioGroupDemo } from "./DropdownMenu";
import { ToggleTheme } from "./ToggleTheme";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      {/* NAV CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-orange-500">ALPHA</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                isActive ? "text-orange-500" : "hover:text-orange-500"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? "text-orange-500" : "hover:text-orange-500"
              }
            >
              About
            </NavLink>
            <NavLink
              to="/services"
              className={({ isActive }) =>
                isActive ? "text-orange-500" : "hover:text-orange-500"
              }
            >
              Services
            </NavLink>

            {/* Custom Dropdown */}
            <DropdownMenuRadioGroupDemo />

            {/* Theme */}
            <ToggleTheme />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-orange-500 focus:outline-none"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Left-side Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobileMenu"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-40 md:hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-2xl font-bold text-orange-500">ALPHA</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-orange-500"
              >
                <X size={26} />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col mt-6 space-y-6 px-6 text-gray-700 font-medium">
              <NavLink
                to="/home"
                onClick={() => setIsOpen(false)}
                className="hover:text-orange-500"
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setIsOpen(false)}
                className="hover:text-orange-500"
              >
                About
              </NavLink>
              <NavLink
                to="/services"
                onClick={() => setIsOpen(false)}
                className="hover:text-orange-500"
              >
                Services
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
