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
      </Routes>
    </BrowserRouter>
  );
}

export default App;