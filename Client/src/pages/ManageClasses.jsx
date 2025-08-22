import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/NavBar";

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [newClassData, setNewClassData] = useState({
    className: "",
    year: "",
    section: "",
  });
  const [incharges, setIncharges] = useState([]);
  const [userInstitution, setUserInstitution] = useState("");
  const [selectedIncharges, setSelectedIncharges] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInstitution = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/current-user", {
          withCredentials: true,
        });

        if (res.data.role === "principal" || res.data.role === "manager") {
          const institutionId =
            typeof res.data.institution === "object"
              ? res.data.institution._id
              : res.data.institution;
          setUserInstitution(institutionId);
        } else {
          alert("Access denied. Only principals can manage classes.");
        }
      } catch (err) {
        console.error("Error fetching user institution:", err);
      }
    };

    fetchUserInstitution();
  }, []);

  useEffect(() => {
    if (!userInstitution) return;

    const fetchData = async () => {
      try {
        const classRes = await axios.get(
          `http://localhost:3001/classes/institute/${userInstitution}`,
          { withCredentials: true }
        );
        const inchargeRes = await axios.get(
          `http://localhost:3001/incharges/${userInstitution}`,
          { withCredentials: true }
        );

        setClasses(classRes.data);
        setIncharges(inchargeRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInstitution]);

  const handleAddClass = async () => {
    const { className, year, section } = newClassData;
    if (!className.trim() || !year || !section.trim()) {
      alert("Please fill out all fields to add a class.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3001/classes",
        {
          className,
          year: Number(year),
          section,
          institute: userInstitution,
        },
        { withCredentials: true }
      );

      setClasses((prev) => [...prev, res.data]);
      setNewClassData({ className: "", year: "", section: "" });
    } catch (err) {
      console.error("Failed to add class:", err);
    }
  };

  const handleDeleteClass = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/classes/${id}`, {
        withCredentials: true,
      });
      setClasses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Failed to delete class:", err);
    }
  };

  const handleAssignIncharge = async (classId) => {
    const inchargeId = selectedIncharges[classId];
    if (!inchargeId) return;

    try {
      const updated = await axios.put(
        `http://localhost:3001/classes/${classId}`,
        {
          classTeacher: inchargeId,
        },
        { withCredentials: true }
      );

      setClasses((prev) =>
        prev.map((c) => (c._id === classId ? updated.data : c))
      );
      setSelectedIncharges((prev) => {
        const updatedMap = { ...prev };
        delete updatedMap[classId];
        return updatedMap;
      });
    } catch (err) {
      console.error("Failed to assign incharge:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 via-green-100 to-green-200">
        <div className="max-w-5xl p-6 mx-auto bg-white shadow-xl rounded-2xl">
          <h2 className="mb-6 text-3xl font-bold text-center text-green-700">
            Manage Classes
          </h2>

          {/* Add Class Form */}
          <div className="grid gap-4 mb-6 sm:grid-cols-3">
            <input
              type="text"
              value={newClassData.className}
              onChange={(e) =>
                setNewClassData({ ...newClassData, className: e.target.value })
              }
              placeholder="Class Name (e.g. CSE)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400"
              required
            />
            <input
              type="number"
              value={newClassData.year}
              onChange={(e) =>
                setNewClassData({ ...newClassData, year: e.target.value })
              }
              placeholder="Year (e.g. 3)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400"
              required
            />
            <input
              type="text"
              value={newClassData.section}
              onChange={(e) =>
                setNewClassData({ ...newClassData, section: e.target.value })
              }
              placeholder="Section (e.g. A)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <button
            onClick={handleAddClass}
            className="w-full py-2 mb-8 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            ➕ Add Class
          </button>

          {/* Class List */}
          {loading ? (
            <p className="text-center text-gray-500">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="text-center text-gray-500">No classes found.</p>
          ) : (
            <div className="space-y-6">
              {classes.map((c) => (
                <div
                  key={c._id}
                  className="flex flex-col justify-between gap-4 p-4 border rounded-lg shadow bg-gray-50 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="text-lg font-semibold text-green-800">
                      {c.className} - Year {c.year}, Section {c.section}
                    </p>
                    <p className="text-sm text-gray-600">
                      Incharge:{" "}
                      {c.classTeacher ? (
                        <span className="font-medium">
                          {c.classTeacher.name}
                        </span>
                      ) : (
                        "Not assigned"
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      value={selectedIncharges[c._id] || ""}
                      onChange={(e) =>
                        setSelectedIncharges((prev) => ({
                          ...prev,
                          [c._id]: e.target.value,
                        }))
                      }
                      className="px-2 py-1 border rounded-lg"
                    >
                      <option value="" disabled>
                        Select Incharge
                      </option>
                      {incharges.map((ic) => (
                        <option key={ic._id} value={ic._id}>
                          {ic.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleAssignIncharge(c._id)}
                      disabled={!selectedIncharges[c._id]}
                      className={`px-4 py-1 text-white rounded-lg ${
                        selectedIncharges[c._id]
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Assign
                    </button>

                    <button
                      onClick={() => handleDeleteClass(c._id)}
                      className="px-4 py-1 text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageClasses;
