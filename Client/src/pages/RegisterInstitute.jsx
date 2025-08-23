import React, { useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/NavBar";

const InstituteRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    instituteCode: "",
    address: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/institutes/register", formData);
      alert("✅ Institute registered successfully!");
      setFormData({
        name: "",
        instituteCode: "",
        address: "",
        email: "",
        phone: "",
      });
    } catch (err) {
      console.error(err);
      alert("❌ Error registering institute");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <Navbar />

      <div className="flex items-center justify-center flex-1 px-4 py-10">
        <div className="w-full max-w-2xl p-8 bg-white shadow-2xl rounded-3xl">
          {/* Title */}
          <h2 className="mb-8 text-3xl font-extrabold text-center text-indigo-700">
            Register Institute
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Institute Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Institute Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Institute Code */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Institute Code
              </label>
              <input
                type="text"
                name="instituteCode"
                value={formData.instituteCode}
                onChange={handleChange}
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white transition rounded-lg shadow bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
              >
                Register
              </button>

              <button
                type="reset"
                onClick={() =>
                  setFormData({
                    name: "",
                    instituteCode: "",
                    address: "",
                    email: "",
                    phone: "",
                  })
                }
                className="flex-1 px-4 py-2 text-white transition bg-red-500 rounded-lg shadow hover:bg-red-600"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstituteRegister;
