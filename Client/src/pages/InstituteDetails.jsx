import React, { useEffect, useState } from "react";
import { useUser } from "../components/UserContext";
import axios from "axios";
import { Mail, Phone, MapPin, Calendar, Tag } from "lucide-react";
import NavBar from "../components/NavBar";

function InstituteDetails() {
  const { institute } = useUser();
  console.log(institute);
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
            "https://mark-register.onrender.com/api/current-user",
            { withCredentials: true }
          );

          if (userRes.data?.institution) {
            instituteId =
              userRes.data.institution._id || userRes.data.institution;
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
            `https://mark-register.onrender.com/institutes/${instituteId}`
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
        <NavBar />
        <div className="flex items-center justify-center mt-20 text-lg font-medium text-gray-600">
          Loading institute details...
        </div>
      </div>
    );

  if (!inst)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
        <NavBar />
        <div className="flex items-center justify-center mt-20 text-lg font-medium text-red-500">
          Failed to load institute details.
        </div>
      </div>
    );

  const formattedAddress = inst.address
    ? `${inst.address.street || ""}, ${inst.address.city || ""}, ${
        inst.address.state || ""
      } - ${inst.address.pincode || ""}`
    : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
      <NavBar />

      <div className="max-w-6xl px-4 py-10 mx-auto sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="flex flex-col items-center gap-6 p-8 bg-white shadow-2xl rounded-3xl sm:flex-row sm:items-center">
          <img
            src={`https://mark-register.onrender.com${inst.logo}`}
            alt={inst.name}
            className="object-contain border-2 border-indigo-200 shadow-sm w-28 h-28 sm:w-36 sm:h-36 rounded-2xl"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-indigo-700 capitalize sm:text-4xl">
              {inst.name}
            </h1>
            <p className="mt-1 text-lg text-gray-600">{inst.type}</p>
            <div className="flex items-center justify-center gap-2 mt-3 text-sm font-semibold text-purple-600 sm:justify-start sm:text-base">
              <Tag size={18} /> <span>{inst.instituteCode}</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2">
          {/* Contact Card */}
          <div className="p-6 transition-shadow bg-white shadow-xl rounded-3xl hover:shadow-2xl">
            <h2 className="mb-5 text-lg font-bold text-indigo-700">
              Contact Information
            </h2>
            <div className="flex items-center gap-3 mb-3 text-gray-600">
              <Phone className="text-purple-500" size={20} />{" "}
              <span>{inst.contact?.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="text-purple-500" size={20} />{" "}
              <span>{inst.contact?.email || "N/A"}</span>
            </div>
          </div>

          {/* Address Card */}
          <div className="p-6 transition-shadow bg-white shadow-xl rounded-3xl hover:shadow-2xl">
            <h2 className="mb-5 text-lg font-bold text-indigo-700">Address</h2>
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="mt-1 text-purple-500" size={20} />{" "}
              <span>{formattedAddress}</span>
            </div>
          </div>
        </div>

        {/* Created At Card */}
        <div className="p-6 mt-8 transition-shadow bg-white shadow-xl rounded-3xl hover:shadow-2xl">
          <h2 className="mb-4 text-lg font-bold text-indigo-700">
            Institute Info
          </h2>
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="text-purple-500" size={20} />
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
