import React, { useState } from "react";
import Navbar from "../components/NavBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingPassword === "" || newPassword === "") {
      alert("Enter all fields to continue");
      return;
    } else if (existingPassword === newPassword) {
      alert("New password can't be the same as the existing password");
      return;
    }

    try {
      const res = await axios.post(
        "https://mark-register.onrender.com/change-password",
        { existingPassword, newPassword },
        { withCredentials: true }
      );

      if (res.data.message === "success") {
        alert("Password changed successfully");
        navigate("/dashboard");
      } else if (res.data.message === "Existing password is incorrect") {
        alert("Existing password is incorrect");
      } else {
        alert("Something went wrong");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("An error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="flex items-center justify-center flex-1 px-4">
        <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl">
          <h2 className="mb-8 text-3xl font-extrabold text-center text-indigo-700">
            Change Your Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Existing Password
              </label>
              <input
                type="password"
                placeholder="Enter existing password"
                value={existingPassword}
                onChange={(e) => setExistingPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-5 py-2 font-semibold text-white transition rounded-lg shadow bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
