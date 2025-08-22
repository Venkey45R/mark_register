import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/NavBar";
import { useUser } from "../components/UserContext";

const UploadLogo = () => {
  const [userInstitution, setUserInstitution] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [loading, setLoading] = useState(true);

  const { institute } = useUser();

  useEffect(() => {
    const fetchUserInstitution = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/current-user", {
          withCredentials: true,
        });

        if (res.data.role === "principal" || res.data.role === "manager") {
          let institutionId = "";

          // Case 1: institution is already populated (object with _id)
          if (
            typeof res.data.institution === "object" &&
            res.data.institution !== null
          ) {
            institutionId = res.data.institution._id;
          }
          // Case 2: institution is stored as string (likely instituteCode)
          else if (typeof res.data.institution === "string") {
            const instRes = await axios.get(
              `http://localhost:3001/api/institutes?name=${res.data.institution}`,
              { withCredentials: true }
            );

            if (!instRes.data || !instRes.data._id) {
              throw new Error("Institute not found for this code");
            }
            institutionId = instRes.data._id;
          } else {
            throw new Error("Institution info is missing in user record");
          }

          setUserInstitution(institutionId);

          // fetch current institute data (for logo preview)
          const instituteRes = await axios.get(
            `http://localhost:3001/institutes/${institutionId}`,
            { withCredentials: true }
          );
          setCurrentLogo(instituteRes.data.logo || "");
        } else {
          alert("Access denied. Only principals/managers can upload logo.");
        }
      } catch (err) {
        console.error("Error fetching user institution:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInstitution();
  }, []);

  useEffect(() => {
    if (institute?._id) {
      axios
        .get(`http://localhost:3001/api/institutes/${institute._id}`, {
          withCredentials: true,
        })
        .then((res) =>
          setCurrentLogo(`http://localhost:3001${res.data.logo || ""}`)
        )
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [institute]);

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleUploadLogo = async () => {
    if (!logoFile) {
      alert("Please select a file to upload.");
      return;
    }
    if (!institute?._id) {
      alert("No institute ID found. Please re-login.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      const res = await axios.put(
        `http://localhost:3001/api/institutes/${institute._id}/logo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      alert("Logo uploaded successfully ✅");
      setCurrentLogo(res.data.institute.logo);
    } catch (err) {
      console.error("Error uploading logo:", err.response?.data || err.message);
      alert("Failed to upload logo.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 via-blue-100 to-blue-200">
        <div className="max-w-xl p-6 mx-auto bg-white shadow-xl rounded-2xl">
          <h2 className="mb-6 text-3xl font-bold text-center text-blue-700">
            Upload Institute Logo
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <>
              {/* Current logo preview */}
              {currentLogo ? (
                <div className="mb-4 text-center">
                  <p className="mb-2 text-gray-700">Current Logo:</p>
                  <img
                    src={`http://localhost:3001${currentLogo}`}
                    alt="Institute Logo"
                    className="h-32 mx-auto rounded-lg shadow"
                  />
                </div>
              ) : (
                <p className="mb-4 text-center text-gray-500">
                  No logo uploaded yet.
                </p>
              )}

              {/* File upload input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full mb-4"
              />

              {/* Upload button */}
              <button
                onClick={handleUploadLogo}
                className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                📤 Upload Logo
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadLogo;
