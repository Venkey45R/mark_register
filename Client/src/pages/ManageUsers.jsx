import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import UserList from "./UserList";
import ChangePasswordModal from "./ChangePasswordModal";
import Toast from "./Toast";
import LoadingSpinner from "./LoadingSpinner";
import NavBar from "../components/NavBar";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type });
    }, 3000);
  };

  const fetchUsers = useCallback(() => {
    setLoading(true);
    axios
      .get("https://mark-register.onrender.com/users", {
        withCredentials: true,
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        showToast("Failed to fetch users.", "error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchUsers();

    axios
      .get("https://mark-register.onrender.com/api/getUserRole", {
        withCredentials: true,
      })
      .then((res) => console.log("User Role Check:", res.data))
      .catch((error) => console.error("Error fetching user role:", error));
  }, [fetchUsers]);

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handlePasswordChange = (userId, newPassword) => {
    return axios
      .post(
        "https://mark-register.onrender.com/admin-change-password",
        { user_id: userId, newPassword },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.message === "Password updated successfully") {
          showToast("Password changed successfully!");
          closeModal();
        } else {
          throw new Error(response.data.message || "Unknown error");
        }
      })
      .catch((err) => {
        console.error("Error changing password:", err);
        showToast(err.message || "Server error changing password.", "error");
        throw err;
      });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-100">
        <div className="max-w-6xl p-6 mx-auto bg-white shadow-xl rounded-2xl">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-indigo-700">Manage Users</h1>
            <p className="mt-2 text-gray-600">
              View, update, and manage user accounts & permissions.
            </p>
          </header>

          <main>
            {users.length === 0 ? (
              <p className="text-center text-gray-500">No users found.</p>
            ) : (
              <UserList users={users} onOpenModal={openModal} />
            )}
          </main>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showModal}
        onClose={closeModal}
        user={selectedUser}
        onConfirm={handlePasswordChange}
      />

      <Toast
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </>
  );
}

export default ManageUsers;
