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
    }, 3000); // Hide after 3 seconds
  };

  const fetchUsers = useCallback(() => {
    setLoading(true);
    axios
      .get("http://localhost:3001/users")
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
    // This second useEffect from the original code remains for its purpose
    axios
      .get("http://localhost:3001/api/getUserRole")
      .then((res) => console.log("User Role Check:", res.data))
      .catch((error) => console.error("Error fetching user role:", error));
  }, [fetchUsers]);

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null); // Deselect user after modal transition
  };

  const handlePasswordChange = (userId, newPassword) => {
    return axios
      .post("http://localhost:3001/admin-change-password", {
        user_id: userId,
        newPassword: newPassword,
      })
      .then((response) => {
        if (response.data.message === "Password updated successfully") {
          showToast("Password changed successfully!");
          closeModal();
        } else {
          throw new Error(
            response.data.message || "An unknown error occurred."
          );
        }
      })
      .catch((err) => {
        console.error("Error changing password:", err);
        showToast(err.message || "Server error changing password.", "error");
        throw err; // Re-throw to be caught in the modal
      });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <NavBar />
      <div className="min-h-screen p-4 font-sans bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              User Management
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Manage user accounts and permissions.
            </p>
          </header>
          <main>
            <UserList users={users} onOpenModal={openModal} />
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
