
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [vehiclesCount, setVehiclesCount] =
    useState(0);

  const [baysCount, setBaysCount] =
    useState(0);

  const [slotsCount, setSlotsCount] =
    useState(0);

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const displayName =
    user?.name ||
    user?.full_name ||
    user?.email ||
    "Operator";

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [
          vehicleData,
          bayData,
          slotData,
        ] = await Promise.all([
          apiRequest("/api/vehicles"),
          apiRequest("/api/charging-bays"),
          apiRequest("/api/grid-slots"),
        ]);

        // -----------------------------
        // Vehicles
        // -----------------------------

        const vehicles = Array.isArray(vehicleData)
          ? vehicleData
          : Array.isArray(vehicleData.vehicles)
          ? vehicleData.vehicles
          : Array.isArray(vehicleData.data)
          ? vehicleData.data
          : [];

        // -----------------------------
        // Charging Bays
        // -----------------------------

        const bays = Array.isArray(bayData)
          ? bayData
          : Array.isArray(
              bayData.chargingBays
            )
          ? bayData.chargingBays
          : Array.isArray(bayData.bays)
          ? bayData.bays
          : Array.isArray(bayData.data)
          ? bayData.data
          : [];

        // -----------------------------
        // Grid Slots
        // -----------------------------

        const slots = Array.isArray(slotData)
          ? slotData
          : Array.isArray(
              slotData.gridSlots
            )
          ? slotData.gridSlots
          : Array.isArray(slotData.slots)
          ? slotData.slots
          : Array.isArray(slotData.data)
          ? slotData.data
          : [];

        setVehiclesCount(vehicles.length);
        setBaysCount(bays.length);
        setSlotsCount(slots.length);
      } catch (error) {
        console.error(
          "Dashboard data error:",
          error
        );
      }
    };

    loadDashboardData();
  }, []);

  return (
    <main className="dashboard-page">
      {/* Mobile menu button */}

      <button
        type="button"
        className={`dashboard-mobile-toggle ${
          mobileMenuOpen ? "active" : ""
        }`}
        onClick={() =>
          setMobileMenuOpen(
            (current) => !current
          )
        }
        aria-label="Toggle navigation"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile overlay */}

      {mobileMenuOpen && (
        <button
          type="button"
          className="dashboard-mobile-overlay"
          onClick={closeMenu}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`dashboard-sidebar ${
          mobileMenuOpen
            ? "mobile-open"
            : ""
        }`}
      >
        <div className="dashboard-brand">
          <Link
            to="/dashboard"
            className="dashboard-brand-link"
            onClick={closeMenu}
          >
            <span className="dashboard-brand-mark">
              EV
            </span>

            <div>
              <strong>SMART EV</strong>
              <span>FLEET OPTIMIZER</span>
            </div>
          </Link>
        </div>

        <nav className="dashboard-nav">
          {/* Core */}

          <span className="dashboard-nav-label">
            CONTROL CENTER
          </span>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              01
            </span>

            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/vehicles"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              02
            </span>

            <span>Vehicles</span>
          </NavLink>

          <NavLink
            to="/bays"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              03
            </span>

            <span>Charging Bays</span>
          </NavLink>

          <NavLink
            to="/grid"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              04
            </span>

            <span>Grid Slots</span>
          </NavLink>

          <NavLink
            to="/sessions"
            className={({ isActive }) =>
