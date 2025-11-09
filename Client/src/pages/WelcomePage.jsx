import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
);

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
    { label: "Update Logo", navigateTo: "/upload-logo" },
    { label: "Download All Report Card", navigateTo: "/download-all-report" },
  ],
  incharge: [
    { label: "Upload Marks", navigateTo: "/upload-marks" },
    { label: "Student Details", navigateTo: "/student-details" },
    { label: "Institute Details", navigateTo: "/update-institute" },
    { label: "Download All Report Card", navigateTo: "/download-all-report" },
  ],
  manager: [
    { label: "Manage Classes", navigateTo: "/manage-classes" },
    { label: "See Results", navigateTo: "/see-results" },
    { label: "Institute's Details", navigateTo: "/update-institute" },
  ],
};

const WelcomePage = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/check-role", { withCredentials: true })
      .then((res) => setRole(res.data.role))
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  console.log(role);

  // fetch stats if admin
  useEffect(() => {
    if (role === "admin") {
      axios
        .get("http://localhost:3001/api/admin/institute-stats", {
          withCredentials: true,
        })
        .then((res) => setStats(res.data))
        .catch((err) => console.error("Failed to fetch stats", err));
    }
  }, [role]);

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

  // chart data
  const chartData = {
    labels: stats.map((s) => s.instituteName),
    datasets: [
      {
        label: "Students",
        data: stats.map((s) => s.studentCount),
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(236, 72, 153, 0.7)",
          "rgba(16, 185, 129, 0.7)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // ✅ important for fixed height
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <main className="flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl p-10 space-y-8 text-center bg-white shadow-2xl rounded-3xl">
          <h1 className="text-4xl font-extrabold text-indigo-700">
            Welcome <span className="text-purple-600 capitalize">{role}</span>
          </h1>
          <p className="text-lg text-gray-600">
            Choose from the available features below to get started.
          </p>

          {/* Features */}
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

          {/* Admin-only Chart */}
          {role === "admin" && stats.length > 0 && (
            <div className="mt-16">
              <h2 className="flex items-center justify-center gap-2 mb-8 text-2xl font-bold text-indigo-700">
                📊 Students per Institute
              </h2>

              <div className="flex justify-center">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-lg h-[350px]">
                  <Pie data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;
