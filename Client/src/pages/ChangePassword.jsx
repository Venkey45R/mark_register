import React, { useState } from 'react'
import Navbar from '../components/NavBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
  const [existingPassword, setExistingPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async(e) => {
  e.preventDefault();
  if(existingPassword === "" || newPassword === ""){
      alert("Enter all fields to continue");
      return;
  }
  else if(existingPassword === newPassword){
      alert("New password can't be same as existing password");
      return;
  }
  try {
    const res = await axios.post('http://localhost:3001/change-password', { existingPassword, newPassword }, { withCredentials: true });
    if(res.data.message === "success"){
        alert("Password changed successfully");
    } else if(res.data.message === "Existing password is incorrect"){
        alert("Existing password is incorrect");
    } else {
        alert("Something went wrong");
    }
  } catch (error) {
    // Handle errors like 400, 500, etc.
    if (error.response && error.response.data && error.response.data.message) {
      alert(error.response.data.message);
    } else {
      alert("An error occurred");
    }
  }
};

  return (
    <div className='flex flex-col min-h-screen bg-[#f0fdf4]'>
      <Navbar />
      <div className='flex items-center justify-center flex-1 px-4'>
        <div className='w-full max-w-md p-8 bg-white shadow-xl rounded-2xl'>
          <h2 className='mb-6 text-3xl font-bold text-center text-[#14532d]'>
            Change Password
          </h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block mb-1 text-sm font-medium text-gray-700'>
                Existing Password
              </label>
              <input
                type='password'
                placeholder='Enter existing password'
                value={existingPassword}
                onChange={(e) => setExistingPassword(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b981]'
                required
              />
            </div>
            <div>
              <label className='block mb-1 text-sm font-medium text-gray-700'>
                New Password
              </label>
              <input
                type='password'
                placeholder='Enter new password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b981]'
                required
              />
            </div>
            <button
              type='submit'
              className='w-full px-4 py-2 mt-4 font-semibold text-white bg-[#10b981] rounded-md hover:bg-emerald-700 transition duration-200'
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