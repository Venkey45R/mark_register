import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Signin";
import WaitPage from "./pages/WaitPage";
import RoleRedirector from "./pages/ProtectedRedirector";
import AdminLandingPage from "./pages/AdminPage";
import AssignRoles from "./pages/AssignRoles";
import InchargeDashboard from "./pages/InchargePage";
import PrincipalDashboard from "./pages/PrincipalPage";
import ManageClasses from "./pages/ManageClasses";
import UploadMarks from "./pages/UploadMark";
import StudentDetails from "./pages/StudentDetails";
import ReportCard from "./pages/ReportCard";
import SeeResults from "./pages/SeeResults";
import ChangePassword from "./pages/ChangePassword";
import ManageUsers from "./pages/ManageUsers";
import AddInstitute from "./pages/AddInstitute";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import ManagerPage from "./pages/ManagerPage";
import WelcomePage from "./pages/WelcomePage";
import UploadLogo from "./pages/UploadLogo";
import InstituteDetails from "./pages/InstituteDetails";
import { Toaster } from "react-hot-toast";

const App = () => (
  <Router>
    <Toaster position="top-center" />
    <Routes>
      <Route path="/" element={<RoleRedirector />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/welcome"
        element={
          <ProtectedRoute
            allowedRoles={["incharge", "manager", "principal", "admin"]}
          >
            <WelcomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <Signup />
          </PublicOnlyRoute>
        }
      />
      <Route path="/wait" element={<WaitPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLandingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload-marks"
        element={
          <ProtectedRoute allowedRoles={["incharge"]}>
            <UploadMarks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManagerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assign-role"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AssignRoles />
          </ProtectedRoute>
        }
      />

      <Route
        path="/incharge"
        element={
          <ProtectedRoute allowedRoles={["incharge"]}>
            <InchargeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/principal"
        element={
          <ProtectedRoute allowedRoles={["principal"]}>
            <PrincipalDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-classes"
        element={
          <ProtectedRoute allowedRoles={["principal", "manager"]}>
            <ManageClasses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload-logo"
        element={
          <ProtectedRoute allowedRoles={["principal", "manager"]}>
            <UploadLogo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-details"
        element={
          <ProtectedRoute allowedRoles={["incharge", "principal"]}>
            <StudentDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/update-institute"
        element={
          <ProtectedRoute allowedRoles={["principal", "incharge"]}>
            <InstituteDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-details/:rollNo"
        element={
          <ProtectedRoute allowedRoles={["incharge", "principal"]}>
            <ReportCard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/see-results"
        element={
          <ProtectedRoute allowedRoles={["principal", "manager"]}>
            <SeeResults />
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "principal", "incharge", "manager"]}
          >
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-institute"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <AddInstitute />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Router>
);

export default App;
