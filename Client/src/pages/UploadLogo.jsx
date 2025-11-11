import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/NavBar";
import { useUser } from "../components/UserContext";

const UploadLogo = () => {
  const [userInstitution, setUserInstitution] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [currentLogo, setCurrentLogo] = useState("");
  const [loading, setLoading] = useState(true);

  const { institute } = useUser();

  useEffect(() => {
    const fetchUserInstitution = async () => {
      try {
        const res = await axios.get(
          "https://mark-register.onrender.com/api/current-user",
          {
            withCredentials: true,
          }
        );

        if (res.data.role === "principal" || res.data.role === "manager") {
          let institutionId = "";

          if (
            typeof res.data.institution === "object" &&
            res.data.institution !== null
          ) {
            institutionId = res.data.institution._id;
          } else if (typeof res.data.institution === "string") {
            const instRes = await axios.get(
              `https://mark-register.onrender.com/api/institutes?name=${res.data.institution}`,
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

          const instituteRes = await axios.get(
            `https://mark-register.onrender.com/institutes/${institutionId}`,
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
        .get(
          `https://mark-register.onrender.com/api/institutes/${institute._id}`,
          {
            withCredentials: true,
          }
        )
        .then((res) =>
          setCurrentLogo(
            `https://mark-register.onrender.com${res.data.logo || ""}`
          )
        )
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [institute]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
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
        `https://mark-register.onrender.com/api/institutes/${institute._id}/logo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      alert("Logo uploaded successfully ✅");
      setCurrentLogo(res.data.institute.logo);
      setFileName("");
      setLogoFile(null);
    } catch (err) {
      console.error("Error uploading logo:", err.response?.data || err.message);
      alert("Failed to upload logo.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
        <div className="max-w-xl p-8 mx-auto bg-white shadow-xl rounded-3xl">
          <h2 className="mb-6 text-3xl font-extrabold text-center text-indigo-700">
            Upload Institute Logo
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <>
              {/* Current logo preview */}
              {currentLogo ? (
                <div className="mb-6 text-center">
                  <p className="mb-2 text-gray-700">Current Logo:</p>
                  <img
                    src={`https://mark-register.onrender.com${currentLogo}`}
                    alt="Institute Logo"
                    className="h-32 mx-auto border shadow-md rounded-xl"
                  />
                </div>
              ) : (
                <p className="mb-6 text-center text-gray-500">
                  No logo uploaded yet.
                </p>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                id="fileInput"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Custom upload button */}
              <div className="flex flex-col items-center mb-4">
                <label
                  htmlFor="fileInput"
                  className="px-6 py-2 font-semibold text-white rounded-lg shadow cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Select Logo
                </label>
                {fileName && (
                  <p className="mt-2 text-sm font-medium text-purple-600">
                    Selected: {fileName}
                  </p>
                )}
              </div>

              {/* Upload button */}
              <button
                onClick={handleUploadLogo}
                className="w-full py-2 font-semibold text-white transition rounded-lg shadow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
