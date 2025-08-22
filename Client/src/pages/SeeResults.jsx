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
      <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-gray-100 via-green-100 to-green-200">
        <div className="max-w-6xl mx-auto">
          <h1 className="mb-6 text-3xl font-bold text-center text-green-800">
            📋 Class Results Overview
          </h1>

          {/* Class Cards */}
          <div className="grid gap-4 mb-10 sm:grid-cols-2 md:grid-cols-3">
            {classes.map((cls) => (
              <div
                key={cls._id}
                onClick={() => handleSelectClass(cls._id)}
                className={`p-4 border rounded-xl shadow-md transition cursor-pointer ${
                  selectedClassId === cls._id
                    ? "bg-green-200 border-green-500"
                    : "bg-white"
                } hover:bg-green-100`}
              >
                <p className="text-lg font-semibold text-green-700">
                  {cls.className} - Year {cls.year}, Section {cls.section}
                </p>
              </div>
            ))}
          </div>

          {/* Student Table */}
          {selectedClassId && (
            <div className="p-6 mt-8 bg-white shadow-md rounded-xl">
              <h2 className="mb-4 text-xl font-semibold text-green-700">
                👨‍🎓 Students in Selected Class
              </h2>

              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-center border border-collapse">
                    <thead className="text-white bg-green-700">
                      <tr>
                        <th className="p-2 border">Roll No</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr key={idx} className="hover:bg-green-50">
                          <td className="p-2 border">{student.rollNo}</td>
                          <td className="p-2 border">{student.name}</td>
                          <td className="p-2 border">
                            <button
                              onClick={() =>
                                navigate(`/student-details/${student.rollNo}`)
                              }
                              className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700"
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
