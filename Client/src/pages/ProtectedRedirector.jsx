import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext"; // adjust path

const RoleRedirector = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setInstitute } = useUser(); // ✅ get setter from context

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/check-role", { withCredentials: true })
      .then((res) => {
        const role = res.data.role;
        setInstitute(res.data.institute); // full object with _id, name, logo...

        if (role === "admin") navigate("/welcome");
        else if (role === "unassigned") navigate("/wait");
        else if (role === "principal") navigate("/welcome");
        else if (role === "incharge") navigate("/welcome");
        else if (role === "manager") navigate("/welcome");
        else navigate("/login");
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mt-10 text-center">Checking role...</div>;
  return null;
};

export default RoleRedirector;
