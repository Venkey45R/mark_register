import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

const PrincipalDashboard = () => {
  const navigate = useNavigate();

  const handleManageClick = () => navigate("/manage-classes");
  const handleSeeResults = () => navigate("/see-results");
  const handleUpdateLogo = () => navigate("/upload-logo");
  const handleUpdateInstitute = () => navigate("/update-institute");

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-gray-100 via-green-100 to-green-200">
        <div className="w-full max-w-lg p-8 text-center bg-white shadow-xl rounded-2xl">
          <h2 className="mb-4 text-3xl font-bold text-green-700 sm:text-4xl">
            Principal Dashboard
          </h2>
          <p className="mb-8 text-gray-600">
            Manage your classes and track overall student performance.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={handleManageClick}
              className="w-full px-6 py-3 font-semibold text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700 sm:w-auto"
            >
              🏫 Manage Classes
            </button>
            <button
              onClick={handleSeeResults}
              className="w-full px-6 py-3 font-semibold text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700 sm:w-auto"
            >
              📊 See Results
            </button>
            <button
              onClick={handleUpdateLogo}
              className="w-full px-6 py-3 font-semibold text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700 sm:w-auto"
            >
              📊 Update Logo
            </button>

            <button
              onClick={handleUpdateInstitute}
              className="w-full px-6 py-3 font-semibold text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700 sm:w-auto"
            >
              📊 Institute Details
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrincipalDashboard;
