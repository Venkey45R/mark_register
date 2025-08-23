import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

const SeeResults = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrincipalClasses = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/current-user", {
          withCredentials: true,
        });

        if (res.data.role !== "principal" || res.data.role === "manager") {
          alert("Access denied. Only principals can view results.");
          return;
        }

        const institutionId =
          typeof res.data.institution === "object"
            ? res.data.institution._id
            : res.data.institution;

        const classRes = await axios.get(
          `http://localhost:3001/classes/institute/${institutionId}`,
          {
            withCredentials: true,
          }
        );

        setClasses(classRes.data);
      } catch (err) {
        console.error("Error fetching principal's classes:", err);
      }
    };

    fetchPrincipalClasses();
  }, []);

  const handleSelectClass = async (classId) => {
    setSelectedClassId(classId);
    try {
      const res = await axios.get(`http://localhost:3001/classes/${classId}`, {
        withCredentials: true,
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <h1 className="mb-8 text-3xl font-extrabold text-center text-indigo-700">
            📋 Class Results Overview
          </h1>

          {/* Class Selection */}
          <div className="grid gap-6 mb-12 sm:grid-cols-2 md:grid-cols-3">
            {classes.map((cls) => (
              <div
                key={cls._id}
                onClick={() => handleSelectClass(cls._id)}
                className={`p-5 cursor-pointer transition rounded-3xl shadow-lg border 
                  ${
                    selectedClassId === cls._id
                      ? "bg-indigo-100 border-indigo-500"
                      : "bg-white hover:bg-indigo-50 border-gray-200"
                  }`}
              >
                <p className="text-lg font-semibold text-indigo-800">
                  {cls.className} – Year {cls.year}, Section {cls.section}
                </p>
              </div>
            ))}
          </div>

          {/* Student Table */}
          {selectedClassId && (
            <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-3xl">
              <h2 className="mb-6 text-xl font-bold text-indigo-700">
                👨‍🎓 Students in Selected Class
              </h2>

              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full overflow-hidden text-sm text-center border border-collapse rounded-lg">
                    <thead className="text-white bg-gradient-to-r from-indigo-600 to-purple-600">
                      <tr>
                        <th className="p-3 border">Roll No</th>
                        <th className="p-3 border">Name</th>
                        <th className="p-3 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr key={idx} className="transition hover:bg-indigo-50">
                          <td className="p-3 border">{student.rollNo}</td>
                          <td className="p-3 border">{student.name}</td>
                          <td className="p-3 border">
                            <button
                              onClick={() =>
                                navigate(`/student-details/${student.rollNo}`)
                              }
                              className="px-4 py-2 text-sm font-medium text-white transition rounded-lg shadow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                              View Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-2 text-gray-600">
                  No students found for this class.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SeeResults;
