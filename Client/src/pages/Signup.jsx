import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

// A simple custom message box component to replace alert()
const MessageBox = ({ message, type, onClose }) => {
  const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`p-6 text-white rounded-lg shadow-lg ${bgColor}`}>
        <p>{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 mt-4 text-black bg-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    institution: "",
    role: "unassigned",
  });
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [isSignedUp, setIsSignedUp] = useState(false); // New state to manage signup status
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCloseMessage = () => {
    setMessage(null);
    setMessageType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    handleCloseMessage();

    const usernamePattern = /^[^@]+@[^@]+$/;
    if (!usernamePattern.test(formData.username)) {
      setMessage("Username must be in the format: username@institute");
      setMessageType("error");
      return;
    }

    try {
      // 1️⃣ Check if institute exists in DB
      // We are calling this route which is not protected
      const res = await axios.get(`/institutes?name=${formData.institution}`);
      if (!res.data || res.data.length === 0) {
        setMessage(
          "Institution not found in our records. Please contact admin."
        );
        setMessageType("error");
        return;
      }

      // 2️⃣ Proceed with signup
      // This is the signup call which creates the user and sets the cookie
      await axios.post("/signup", { formData });

      // Update the state to indicate successful signup
      setIsSignedUp(true);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Signup Failed. Please try again."
      );
      setMessageType("error");
    }
  };

  useEffect(() => {
    if (isSignedUp) {
      setMessage("Signup Successful! Redirecting...");
      setMessageType("success");
      const timer = setTimeout(() => {
        navigate("/wait"); // 👈 redirect to /role
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSignedUp, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#f0fdf4]">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
        <h2 className="mb-6 text-3xl font-bold text-center text-[#14532d]">
          Create Account 📝
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            required
          />
          <input
            name="username"
            placeholder="Username (username@institute)"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            required
          />
          <input
            name="institution"
            placeholder="Institution"
            value={formData.institution}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-[#10b981] rounded-md hover:bg-emerald-700"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already registered?{" "}
          <Link to="/login" className="font-medium text-[#14532d] underline">
            Sign In
          </Link>
        </p>
      </div>
      {message && (
        <MessageBox
          message={message}
          type={messageType}
          onClose={handleCloseMessage}
        />
      )}
    </div>
  );
};

export default Signup;
