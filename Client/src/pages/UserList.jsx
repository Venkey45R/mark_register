import React from "react";
import { KeyIcon } from "./Icon"; // Assuming you have an Icon helper

const RoleBadge = ({ role }) => {
  const roleColors = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    editor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        roleColors[role.toLowerCase()] || "bg-gray-100 text-gray-800"
      }`}
    >
      {role}
    </span>
  );
};

const UserList = ({ users, onOpenModal }) => {
  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                User
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                Institution
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                Role
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr
                key={user._id}
                className="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.username}
                  </div>
                </td>

                {/* ✅ FIXED */}
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                  {user.institution?.name || "N/A"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                  <button
                    onClick={() => onOpenModal(user)}
                    className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
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
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <li key={user._id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.institution?.name || "N/A"}
                  </div>
                </div>
                <RoleBadge role={user.role} />
              </div>
              <div className="mt-4">
                <button
                  onClick={() => onOpenModal(user)}
                  className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
