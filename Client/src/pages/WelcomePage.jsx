import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

const roleFeatures = {
  admin: [
    { label: "Assign User Roles", navigateTo: "/assign-role" },
    { label: "Manage Users", navigateTo: "/manage-users" },
    { label: "Add Institute", navigateTo: "/add-institute" },
  ],
  principal: [
    { label: "Manage Classes", navigateTo: "/manage-classes" },
    { label: "See Results", navigateTo: "/see-results" },
    { label: "Institute Details", navigateTo: "/update-institute" },
  ],
  incharge: [
    { label: "Upload Marks", navigateTo: "/upload-marks" },
    { label: "Student Details", navigateTo: "/student-details" },
    { label: "Institute Details", navigateTo: "/update-institute" },
  ],
  manager: [
    { label: "Manage Classes", navigateTo: "/manage-classes" },
    { label: "See Results", navigateTo: "/see-results" },
    { label: "Update Institute Details", navigateTo: "/update-institute" },
  ],
};

const WelcomePage = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/check-role", { withCredentials: true })
      .then((res) => setRole(res.data.role))
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <p className="text-xl font-semibold text-gray-700 animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  const features = role && roleFeatures[role] ? roleFeatures[role] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl p-10 space-y-8 text-center bg-white shadow-2xl rounded-3xl">
          {/* Welcome Header */}
          <h1 className="text-4xl font-extrabold text-indigo-700">
            Welcome <span className="text-purple-600 capitalize">{role}</span>
          </h1>
          <p className="text-lg text-gray-600">
            Choose from the available features below to get started.
          </p>

          {/* Feature Buttons */}
          <div className="grid gap-6 mt-8 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => navigate(feature.navigateTo)}
                className="px-6 py-4 font-semibold text-white transition-all duration-200 transform shadow-md rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:-translate-y-1 hover:shadow-xl"
              >
                {feature.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;
