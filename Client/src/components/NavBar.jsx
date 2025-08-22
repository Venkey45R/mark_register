import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const KeyIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h4a6 6 0 016 6z"
    />
  </svg>
);
const LogoutIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);
const MenuIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
const CloseIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleChangePassword = () => navigate("/change-password");

  return (
    <nav className="sticky top-0 z-50 w-full shadow-lg bg-gradient-to-r from-indigo-50 via-white to-purple-50 backdrop-blur-sm">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            onClick={() => navigate("/welcome")}
            className="text-2xl font-extrabold tracking-tight text-indigo-600 transition-colors duration-300 cursor-pointer hover:text-indigo-700"
          >
            Student Mark System
          </div>

          {/* Desktop Menu */}
          <div className="items-center hidden space-x-4 md:flex">
            <button
              onClick={handleChangePassword}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg hover:bg-indigo-50"
            >
              <KeyIcon className="w-5 h-5 text-indigo-500" />
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-indigo-600 rounded-lg shadow hover:bg-indigo-700"
            >
              <LogoutIcon className="w-5 h-5" />
              Log Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 text-gray-600 transition-colors duration-200 rounded-md hover:bg-indigo-100"
            >
              {isMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="px-2 pt-2 pb-3 space-y-2 md:hidden">
          <button
            onClick={handleChangePassword}
            className="flex items-center w-full gap-3 px-3 py-2 text-base font-medium text-gray-700 transition-colors duration-200 rounded-lg hover:bg-indigo-50"
          >
            <KeyIcon className="w-5 h-5 text-indigo-500" />
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-3 py-2 text-base font-medium text-white transition-all duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <LogoutIcon className="w-5 h-5" />
            Log Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
