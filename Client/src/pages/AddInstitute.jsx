import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

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

    // Handle nested fields like address.city
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
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add institute");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 py-10 bg-green-50">
        <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-xl">
          <h2 className="mb-6 text-2xl font-bold text-center text-green-700">
            Add New Institute
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Institute Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
            <input
              name="instituteCode"
              placeholder="Institute Code"
              value={formData.instituteCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="school">School</option>
              <option value="college">College</option>
            </select>

            <h3 className="mt-4 font-semibold text-green-700">Address</h3>
            <input
              name="address.street"
              placeholder="Street"
              value={formData.address.street}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              name="address.city"
              placeholder="City"
              value={formData.address.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              name="address.state"
              placeholder="State"
              value={formData.address.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              name="address.pincode"
              placeholder="Pincode"
              value={formData.address.pincode}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />

            <h3 className="mt-4 font-semibold text-green-700">Contact</h3>
            <input
              name="contact.phone"
              placeholder="Phone"
              value={formData.contact.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              name="contact.email"
              placeholder="Email"
              value={formData.contact.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              name="contact.website"
              placeholder="Website"
              value={formData.contact.website}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />

            <button
              type="submit"
              className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Add Institute
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-center text-green-700">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddInstitute;
