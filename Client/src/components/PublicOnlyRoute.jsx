import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../api/axios";

const PublicOnlyRoute = ({ children }) => {
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

  if (role) {
    // Redirect based on role
    switch (role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "incharge":
        return <Navigate to="/incharge" replace />;
      case "principal":
        return <Navigate to="/principal" replace />;
      case "manager":
        return <Navigate to="/manage-classes" replace />;
      default:
        return <Navigate to="/wait" replace />;
    }
  }

  // Not logged in → allow access
  return children;
};

export default PublicOnlyRoute;
