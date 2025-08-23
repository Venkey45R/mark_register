import React, { useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    institution: "",
    role: "unassigned",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usernamePattern = /^[^@]+@[^@]+$/;
    if (!usernamePattern.test(formData.username)) {
      toast.error("Username must be in the format: username@institute");
      return;
    }

    try {
      // 1️⃣ Check if institute exists
      const res = await axios.get(`/institutes?name=${formData.institution}`);
      if (!res.data || res.data.length === 0) {
        toast.error(
          "Institution not found in our records. Please contact admin."
        );
        return;
      }

      // 2️⃣ Proceed with signup
      await axios.post("/signup", { formData });
      toast.success("signup succesful");
      // 3️⃣ Redirect immediately
      navigate("/wait");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Signup Failed. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl">
        {/* Title */}
        <h2 className="mb-6 text-3xl font-extrabold text-center text-indigo-700">
          Create Account 📝
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            name="username"
            placeholder="Username (username@institute)"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            name="institution"
            placeholder="Institution"
            value={formData.institution}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white transition rounded-lg shadow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Sign Up
          </button>
        </form>

        {/* Link to Login */}
        <p className="mt-5 text-sm text-center text-gray-600">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
