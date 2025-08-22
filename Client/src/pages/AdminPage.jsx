import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

const AdminLandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-green-100">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-xl p-8 text-center bg-white shadow-xl rounded-2xl">
          <h1 className="mb-4 text-3xl font-bold text-green-700 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mb-6 text-base text-gray-600 sm:text-lg">
            Welcome, Admin! You can authorize users, assign roles, and manage
            institutes.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <button
              onClick={() => navigate("/assign-role")}
              className="px-6 py-2 text-white transition-all duration-200 bg-green-600 rounded-md shadow-sm hover:bg-green-700"
            >
              Assign User Roles
            </button>
            <button
              onClick={() => navigate("/manage-users")}
              className="px-6 py-2 text-white transition-all duration-200 bg-green-600 rounded-md shadow-sm hover:bg-green-700"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate("/add-institute")}
              className="px-6 py-2 text-white transition-all duration-200 bg-green-600 rounded-md shadow-sm hover:bg-green-700"
            >
              Add Institute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;
