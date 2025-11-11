import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/NavBar";

const AssignRoles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleUpdates, setRoleUpdates] = useState({});

  useEffect(() => {
    axios
      .get("https://mark-register.onrender.com/users", {
        withCredentials: true,
      })
      .then((res) => {
        const unassigned = res.data.filter((u) => u.role === "unassigned");
        setUsers(unassigned);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setRoleUpdates((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleAssign = async (userId) => {
    const newRole = roleUpdates[userId];
    if (!newRole) return;

    try {
      await axios.put(
        `https://mark-register.onrender.com/users/${userId}`,
        { role: newRole },
        { withCredentials: true }
      );
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-6xl p-8 mx-auto bg-white shadow-2xl rounded-3xl">
          <h2 className="mb-8 text-3xl font-extrabold text-center text-indigo-700">
            Assign Roles to New Users
          </h2>

          {loading ? (
            <p className="text-center text-gray-500 animate-pulse">
              Loading users...
            </p>
          ) : users.length === 0 ? (
            <p className="font-semibold text-center text-green-600">
              🎉 All users have been assigned roles!
            </p>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full overflow-hidden text-sm border border-gray-200 shadow-md rounded-2xl">
                  <thead className="text-white bg-gradient-to-r from-indigo-600 to-purple-600">
                    <tr>
                      <th className="p-4 text-left">Name</th>
                      <th className="p-4 text-left">Username</th>
                      <th className="p-4 text-left">Institution</th>
                      <th className="p-4 text-left">Assign Role</th>
                      <th className="p-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="transition border-t hover:bg-gray-50"
                      >
                        <td className="p-4">{user.name}</td>
                        <td className="p-4">{user.username}</td>
                        <td className="p-4">
                          {user.institution?.name || "N/A"}
                        </td>
                        <td className="p-4">
                          <select
                            value={roleUpdates[user._id] || ""}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                          >
                            <option value="">Select role</option>
                            <option value="principal">Principal</option>
                            <option value="incharge">Incharge</option>
                            <option value="manager">Manager</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleAssign(user._id)}
                            disabled={!roleUpdates[user._id]}
                            className={`px-5 py-2 rounded-lg font-semibold transition ${
                              roleUpdates[user._id]
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow"
                                : "bg-gray-300 text-gray-600 cursor-not-allowed"
                            }`}
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="mt-6 space-y-6 sm:hidden">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="p-6 bg-white border shadow-md rounded-2xl"
                  >
                    <p className="mb-1">
                      <span className="font-semibold">Name:</span> {user.name}
                    </p>
                    <p className="mb-1">
                      <span className="font-semibold">Username:</span>{" "}
                      {user.username}
                    </p>
                    <p className="mb-3">
                      <span className="font-semibold">Institution:</span>{" "}
                      {user.institution?.name || "N/A"}
                    </p>

                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Assign Role
                    </label>
                    <select
                      value={roleUpdates[user._id] || ""}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className="w-full px-3 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="">Select role</option>
                      <option value="principal">Principal</option>
                      <option value="incharge">Incharge</option>
                      <option value="manager">Manager</option>
                    </select>
                    <button
                      onClick={() => handleAssign(user._id)}
                      disabled={!roleUpdates[user._id]}
                      className={`w-full px-5 py-2 rounded-lg font-semibold transition ${
                        roleUpdates[user._id]
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AssignRoles;
