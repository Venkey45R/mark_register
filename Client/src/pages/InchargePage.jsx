import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';

const InchargeDashboard = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => navigate('/upload-marks');
  const handleStudentClicks = () => navigate('/student-details');

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-gray-100 via-green-100 to-green-200">
        <div className="w-full max-w-lg p-10 text-center bg-white shadow-xl rounded-2xl">
          <h2 className="mb-6 text-3xl font-extrabold text-green-700">Incharge Dashboard</h2>
          <p className="mb-8 text-gray-600">
            Manage class results and student details efficiently.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={handleUploadClick}
              className="px-6 py-3 font-medium text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700"
            >
              📤 Upload Marks
            </button>
            <button
              onClick={handleStudentClicks}
              className="px-6 py-3 font-medium text-white transition-all duration-200 bg-green-600 rounded-lg hover:bg-green-700"
            >
              📚 Student Details
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InchargeDashboard;
