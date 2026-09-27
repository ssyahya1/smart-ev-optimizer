import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/DashboardOverview";
import Vehicles from "./pages/Vehicles/Vehicles";
import ChargingBays from "./pages/ChargingBays/ChargingBays";
import GridSlots from "./pages/GridSlots/GridSlots";
import ChargingSessions from "./pages/ChargingSessions/ChargingSessions";
import Assignment from "./pages/Optimization/Assignment";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminVehicles from "./pages/Admin/AdminVehicles";
import AdminChargingSessions from "./pages/Admin/AdminChargingSessions";
import AdminChargingBays from "./pages/Admin/AdminChargingBays";
import AdminGridSlots from "./pages/Admin/AdminGridSlots";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";
import "./app-theme.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected pages */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/bays" element={<ChargingBays />} />
          <Route path="/grid" element={<GridSlots />} />
          <Route path="/sessions" element={<ChargingSessions />} />
          <Route path="/charging-plan" element={<Assignment />} />
          <Route path="/assignment" element={<Navigate to="/charging-plan" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/vehicles" element={<AdminVehicles />} />
          <Route path="/admin/charging-sessions" element={<AdminChargingSessions />} />
          <Route path="/admin/charging-bays" element={<AdminChargingBays />} />
          <Route path="/admin/grid-slots" element={<AdminGridSlots />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;