import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';

const StudentDetails = () => {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  // Fetch current incharge and assigned classes
  useEffect(() => {
    const fetchAssignedClasses = async () => {
      try {
        const userRes = await axios.get('http://localhost:3001/api/current-user', { withCredentials: true });
        const inchargeId = userRes.data._id;

        const classRes = await axios.get(`http://localhost:3001/api/incharge-classes/${inchargeId}`, {
          withCredentials: true,
        });

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
        const res = await axios.get(`http://localhost:3001/api/class-students/${selectedClassId}`, {
          withCredentials: true,
        });

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
        <h1 className="mb-6 text-3xl font-bold text-green-700">📘 Student Register</h1>

        {/* Class Selector */}
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">Select Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="block w-full p-2 text-sm border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          >
            <option value="">-- Choose a class --</option>
            {assignedClasses.map(cls => (
              <option key={cls._id} value={cls._id}>
                {cls.className} - Year {cls.year}, Section {cls.section}
              </option>
            ))}
          </select>
        </div>

        {/* Student Table */}
        {students.length > 0 ? (
          <div className="overflow-auto border rounded-md shadow">
            <table className="w-full text-sm text-center border-collapse">
              <thead className="text-white bg-green-700">
                <tr>
                  <th className="p-3 border">Roll No</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {students.map((student, idx) => (
                  <tr key={idx} className="border-t hover:bg-green-50">
                    <td className="p-2 border">{student.rollNo}</td>
                    <td className="p-2 border">{student.name}</td>
                    <td className="p-2 border">
                      <button
                        className="px-4 py-1 text-white bg-green-600 rounded hover:bg-green-700"
                        onClick={() => navigate(`/student-details/${student.rollNo}`)}
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
            <div className="p-4 mt-6 text-center text-gray-600 bg-white border rounded shadow">
              No students found in this class.
            </div>
          )
        )}
      </div>
    </>
  );
};

export default StudentDetails;
