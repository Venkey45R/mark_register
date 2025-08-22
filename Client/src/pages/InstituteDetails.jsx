import React, { useEffect, useState } from "react";
import { useUser } from "../components/UserContext";
import axios from "axios";
import { Mail, Phone, MapPin, Calendar, Tag } from "lucide-react";
import NavBar from "../components/NavBar";

function InstituteDetails() {
  const { institute } = useUser();
  const [inst, setInst] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstituteDetails = async () => {
      setLoading(true);
      let instituteId = null;

      if (institute?._id) {
        instituteId = institute._id;
      } else {
        try {
          const userRes = await axios.get(
            "http://localhost:3001/api/current-user",
            { withCredentials: true }
          );
          if (userRes.data?.institution?._id) {
            instituteId = userRes.data.institution._id;
          }
        } catch (err) {
          console.error("Error fetching current user:", err);
          setLoading(false);
          return;
        }
      }

      if (instituteId) {
        try {
          const res = await axios.get(
            `http://localhost:3001/institutes/${instituteId}`
          );
          setInst(res.data);
        } catch (err) {
          console.error("Error fetching institute:", err);
          setInst(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchInstituteDetails();
  }, [institute]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen font-medium text-gray-500 bg-gradient-to-b from-indigo-50 to-purple-50">
        <NavBar />
        <p className="mt-10 text-lg">Loading institute details...</p>
      </div>
    );

  if (!inst)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen font-medium text-gray-500 bg-gradient-to-b from-indigo-50 to-purple-50">
        <NavBar />
        <p className="mt-10 text-lg">Failed to load institute details.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <NavBar />

      <div className="max-w-6xl px-4 py-10 mx-auto sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="flex flex-col items-center gap-6 p-8 bg-white shadow-xl rounded-3xl sm:flex-row sm:items-center">
          <img
            src={`http://localhost:3001${inst.logo}`}
            alt={inst.name}
            className="object-contain border-2 border-indigo-200 shadow-sm w-28 h-28 sm:w-36 sm:h-36 rounded-xl"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-gray-800 capitalize sm:text-4xl">
              {inst.name}
            </h1>
            <p className="mt-1 text-gray-600 text-md sm:text-lg">{inst.type}</p>
            <div className="flex items-center justify-center gap-2 mt-3 text-sm font-medium text-indigo-700 sm:justify-start sm:text-base">
              <Tag size={18} /> <span>{inst.instituteCode}</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2">
          {/* Contact Card */}
          <div className="p-6 transition-shadow duration-300 bg-white shadow-lg rounded-3xl hover:shadow-2xl">
            <h2 className="mb-5 text-lg font-semibold text-gray-700">
              Contact Information
            </h2>
            <div className="flex items-center gap-3 mb-3 text-gray-600">
              <Phone className="text-indigo-500" size={20} />{" "}
              <span>{inst.contact?.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="text-indigo-500" size={20} />{" "}
              <span>{inst.contact?.email}</span>
            </div>
          </div>

          {/* Address Card */}
          <div className="p-6 transition-shadow duration-300 bg-white shadow-lg rounded-3xl hover:shadow-2xl">
            <h2 className="mb-5 text-lg font-semibold text-gray-700">
              Address
            </h2>
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="mt-1 text-indigo-500" size={20} />{" "}
              <span>{inst.address}</span>
            </div>
          </div>
        </div>

        {/* Created At Card */}
        <div className="p-6 mt-8 transition-shadow duration-300 bg-white shadow-lg rounded-3xl hover:shadow-2xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            Institute Info
          </h2>
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="text-indigo-500" size={20} />
            <span>
              Created on {new Date(inst.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstituteDetails;
