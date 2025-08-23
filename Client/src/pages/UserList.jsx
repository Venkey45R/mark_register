import React from "react";
import { KeyIcon } from "./Icon"; // Assuming you have an Icon helper

const RoleBadge = ({ role }) => {
  const roleColors = {
    admin: "bg-red-100 text-red-800",
    user: "bg-indigo-100 text-indigo-800",
    editor: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${
        roleColors[role.toLowerCase()] || "bg-gray-100 text-gray-800"
      }`}
    >
      {role}
    </span>
  );
};

const UserList = ({ users, onOpenModal }) => {
  return (
    <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-indigo-100">
            <tr>
              <th className="px-6 py-3 font-semibold uppercase">User</th>
              <th className="px-6 py-3 font-semibold uppercase">Institution</th>
              <th className="px-6 py-3 font-semibold uppercase">Role</th>
              <th className="px-6 py-3 font-semibold text-center uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr
                key={user._id}
                className="transition duration-200 hover:bg-indigo-50"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.username}</div>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {user.institution?.name || "N/A"}
                </td>

                <td className="px-6 py-4">
                  <RoleBadge role={user.role} />
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onOpenModal(user)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <KeyIcon className="w-4 h-4" />
                    Change Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user._id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold text-gray-900">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                  <div className="text-sm text-gray-500">
                    {user.institution?.name || "N/A"}
                  </div>
                </div>
                <RoleBadge role={user.role} />
              </div>
              <div className="mt-4">
                <button
                  onClick={() => onOpenModal(user)}
                  className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-semibold text-white transition bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <KeyIcon className="w-5 h-5" />
                  Change Password
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserList;
