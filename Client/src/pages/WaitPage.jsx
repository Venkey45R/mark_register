import React from "react";
import Navbar from "../components/NavBar";

const WaitPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
      <Navbar />
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 text-center bg-white shadow-2xl rounded-3xl md:p-12">
          <h1 className="mb-4 text-3xl font-extrabold text-indigo-700 md:text-4xl">
            ⏳ Hold On!
          </h1>
          <p className="mb-4 text-lg text-gray-700">
            You’ve successfully signed up, but your account is not yet
            authorized.
          </p>
          <p className="text-gray-500">
            Please wait while the admin reviews and activates your access.
          </p>
          <div className="mt-6 font-semibold text-purple-600 animate-pulse">
            🔒 Waiting for admin approval...
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitPage;
