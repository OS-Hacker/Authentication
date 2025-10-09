import React, { useCallback, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { api } from "@/services/Api";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Make API request to logout endpoint using `api` which sets withCredentials
      await api.delete(`/auth/logout`);
      setAuth(null);

      navigate("/login");
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      // Even if API call fails, clear local auth state
      setAuth(null);
    }
  }, [navigate, setAuth]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-2xl font-bold text-orange-500">
            ALPHA
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <NavLink to="home" className="hover:text-orange-500">
              Home
            </NavLink>
            <NavLink to="#about" className="hover:text-orange-500">
              About
            </NavLink>
            <NavLink to="#services" className="hover:text-orange-500">
              Services
            </NavLink>
            <NavLink to="#contact" className="hover:text-orange-500">
              Contact
            </NavLink>

            <button
              onClick={logout}
              className="bg-red-500 text-white px-2 py-1 text-sm rounded cursor-pointer"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-orange-500 focus:outline-none"
            >
              {isOpen ? "" : <Menu size={26} />}
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
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-2xl font-semibold text-blue-600">ALPHA</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-blue-600"
              >
                <X size={26} />
              </button>
            </div>

            <div className="flex flex-col mt-4 space-y-4 px-4 text-gray-700 font-medium">
              <NavLink
                to="Home"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600"
              >
                Home
              </NavLink>
              <NavLink
                to="About"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600"
              >
                About
              </NavLink>
              <NavLink
                to="Services"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600"
              >
                Services
              </NavLink>
              <NavLink
                to="#contact"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600"
              >
                Contact
              </NavLink>

              <button
                onClick={logout}
                className="bg-red-500 text-white px-2 py-1 text-sm rounded cursor-pointer"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
