import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/NavBar";

const RegisterInstitute = () => {
  const [instituteDetails, setInstituteDetails] = useState({
    instituteName: "",
    address: "",
    city: "",
    state: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setInstituteDetails({
      ...instituteDetails,
      [e.target.name]: e.target.value,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        "/api/register-institute",
        instituteDetails,
        { withCredentials: true }
      );

      if (res.status === 201) {
        setMessage("Institute registered successfully!");
        // Redirect to principal dashboard after successful registration
        navigate("/principal");
      } else {
        setMessage(res.data?.message || "Failed to register institute.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
          <h2 className="mb-6 text-3xl font-bold text-center text-green-700">
            Register Institute
          </h2>
          <p className="mb-6 text-center text-gray-600">
            Please provide the details for your new institute.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="instituteName"
              placeholder="Institute Name"
              value={instituteDetails.instituteName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={instituteDetails.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={instituteDetails.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={instituteDetails.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Register
            </button>
          </form>
          {message && (
            <p className="mt-4 text-sm text-center text-red-600">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterInstitute;
