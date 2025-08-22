import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../api/axios";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/check-role", { withCredentials: true })
      .then((res) => {
        setRole(res.data.role);
        setLoading(false);
      })
      .catch(() => {
        setRole(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  // Not logged in
  if (!role) return <Navigate to="/login" replace />;

  // Logged in but role not allowed
  if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
