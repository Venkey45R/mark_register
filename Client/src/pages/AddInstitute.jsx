import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import toast from "react-hot-toast";

const AddInstitute = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    instituteCode: "",
    type: "school",
    address: { street: "", city: "", state: "", pincode: "" },
    contact: { phone: "", email: "", website: "" },
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/institutes", formData, { withCredentials: true });
      setMessage("Institute added successfully!");
      const successMsg = "Institute added successfully!";
      toast.success(successMsg);
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "❌ Failed to add institute";
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl p-8 bg-white shadow-2xl rounded-3xl">
          {/* Title */}
          <h2 className="mb-6 text-3xl font-bold text-center text-indigo-700">
            Add New Institute
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Institute Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Institute Name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Institute Code
              </label>
              <input
                name="instituteCode"
                value={formData.instituteCode}
                onChange={handleChange}
                placeholder="Institute Code"
                className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="school">School</option>
                <option value="college">College</option>
              </select>
            </div>

            {/* Address */}
            <h3 className="pt-2 font-semibold text-indigo-600">Address</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                name="address.street"
                placeholder="Street"
                value={formData.address.street}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                name="address.city"
                placeholder="City"
                value={formData.address.city}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                name="address.state"
                placeholder="State"
                value={formData.address.state}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                name="address.pincode"
                placeholder="Pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Contact */}
            <h3 className="pt-2 font-semibold text-indigo-600">Contact</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                name="contact.phone"
                placeholder="Phone"
                value={formData.contact.phone}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                name="contact.email"
                placeholder="Email"
                value={formData.contact.email}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                name="contact.website"
                placeholder="Website"
                value={formData.contact.website}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg sm:col-span-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    name: "",
                    instituteCode: "",
                    type: "school",
                    address: { street: "", city: "", state: "", pincode: "" },
                    contact: { phone: "", email: "", website: "" },
                  })
                }
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Institute
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInstitute;
