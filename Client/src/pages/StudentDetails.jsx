import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

const StudentDetails = () => {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  // Fetch current incharge and assigned classes
  useEffect(() => {
    const fetchAssignedClasses = async () => {
      try {
        const userRes = await axios.get(
          "http://localhost:3001/api/current-user",
          {
            withCredentials: true,
          }
        );
        const inchargeId = userRes.data._id;

        const classRes = await axios.get(
          `http://localhost:3001/api/incharge-classes/${inchargeId}`,
          { withCredentials: true }
        );

        setAssignedClasses(classRes.data);
      } catch (err) {
        console.error("Failed to fetch assigned classes:", err);
      }
    };

    fetchAssignedClasses();
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) return;

      try {
        const res = await axios.get(
          `http://localhost:3001/api/class-students/${selectedClassId}`,
          { withCredentials: true }
        );

        setStudents(res.data);
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };

    fetchStudents();
  }, [selectedClassId]);

  return (
    <>
      <Navbar />
      <div className="px-4 py-10 mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-extrabold text-center text-indigo-700">
          📘 Student Register
        </h1>

        {/* Class Selector */}
        <div className="max-w-lg p-6 mx-auto mb-8 bg-white shadow-xl rounded-3xl">
          <label className="block mb-2 font-medium text-gray-700">
            Select Class:
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="block w-full p-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Choose a class --</option>
            {assignedClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className} - Year {cls.year}, Section {cls.section}
              </option>
            ))}
          </select>
        </div>

        {/* Student Table */}
        {students.length > 0 ? (
          <div className="overflow-auto bg-white border shadow-xl rounded-3xl">
            <table className="w-full text-sm text-center border-collapse">
              <thead className="text-white bg-indigo-700">
                <tr>
                  <th className="p-3 border">Roll No</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr
                    key={idx}
                    className="transition border-t hover:bg-indigo-50"
                  >
                    <td className="p-2 border">{student.rollNo}</td>
                    <td className="p-2 border">{student.name}</td>
                    <td className="p-2 border">
                      <button
                        className="px-4 py-2 text-sm font-medium text-white transition rounded-lg shadow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        onClick={() =>
                          navigate(`/student-details/${student.rollNo}`)
                        }
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
          selectedClassId && (
            <div className="max-w-lg p-6 mx-auto mt-6 text-center text-gray-600 bg-white border shadow-xl rounded-3xl">
              No students found in this class.
            </div>
          )
        )}
      </div>
    </>
  );
};

export default StudentDetails;
