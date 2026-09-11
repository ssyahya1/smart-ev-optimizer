import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Vehicles from "./pages/Vehicles/Vehicles";
import ChargingBays from "./pages/ChargingBays/ChargingBays";
import GridSlots from "./pages/GridSlots/GridSlots";
import ChargingSessions from "./pages/ChargingSessions/ChargingSessions";
import Assignment from "./pages/Optimization/Assignment";
import Scheduling from "./pages/Optimization/Scheduling";
import Power from "./pages/Optimization/Power";
import Routing from "./pages/Optimization/Routing";
import Journey from "./pages/Optimization/Journey";
import ResourceAllocation from "./pages/Optimization/ResorceAllocation";
import Benchmarks from "./pages/Optimization/Benchmark";

import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

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

          {/* Optimization */}
          <Route path="/assignment" element={<Assignment />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/power" element={<Power />} />
          <Route path="/routing" element={<Routing />} />
          <Route path="/journey" element={<Journey />} />
          <Route
            path="/resource-allocation"
            element={<ResourceAllocation />}
          />

          {/* Analysis */}
          <Route path="/benchmarks" element={<Benchmarks />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;