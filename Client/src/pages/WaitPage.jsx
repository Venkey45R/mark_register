import React from 'react';
import Navbar from '../components/NavBar';

const WaitPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <Navbar />
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 text-center bg-white shadow-lg rounded-2xl md:p-12">
          <h1 className="mb-4 text-3xl font-extrabold text-green-700 md:text-4xl">
            ⏳ Hold On!
          </h1>
          <p className="mb-4 text-lg text-gray-700">
            You’ve successfully signed up, but your account is not yet authorized.
          </p>
          <p className="text-gray-500">
            Please wait while the admin reviews and activates your access.
          </p>
          <div className="mt-6 font-semibold text-green-600 animate-pulse">
            🔒 Waiting for admin approval...
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitPage;
