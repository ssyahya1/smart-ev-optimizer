import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";
import "./Admin.css";

function AdminDashboard() {
  const [data, setData] = useState({
    users: { total: 0, admins: 0, normal: 0 },
    vehicles: { total: 0 },
    chargingSessions: { total: 0, active: 0, completed: 0 },
    chargingBays: { total: 0, available: 0, occupied: 0 },
    gridSlots: { total: 0 },
    recentUsers: [],
    recentVehicles: [],
    recentChargingSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/admin/dashboard")
      .then((response) => {
        if (!active) return;
        setData(response.data || response);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Unable to load the admin dashboard.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const cards = [
    { label: "Total Users", value: data.users.total },
    { label: "Total Vehicles", value: data.vehicles.total },
    { label: "Active Charging Sessions", value: data.chargingSessions.active },
    { label: "Available Charging Bays", value: data.chargingBays.available },
    { label: "Occupied Charging Bays", value: data.chargingBays.occupied },
    { label: "Grid Slots", value: data.gridSlots.total },
  ];

  return (
    <section className="admin-page" aria-busy={loading}>
      <header className="admin-header">
        <div>
          <span className="section-label">ADMIN / OVERVIEW</span>
          <h1>Dashboard</h1>
        </div>
      </header>

      {error && <div className="admin-alert" role="alert">{error}</div>}

      <div className="admin-metrics-grid">
        {cards.map((card) => (
          <article className="admin-metric-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{loading ? "—" : card.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-panels-grid">
        <div className="admin-panel">
          <h2>Recent Users</h2>
          {loading ? <p>Loading…</p> : data.recentUsers.length ? (
            <ul className="admin-list">
              {data.recentUsers.map((user) => (
                <li key={user.id}>
                  <div>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                  <span className={`status-pill ${user.role === "admin" ? "status-admin" : "status-user"}`}>{user.role}</span>
                </li>
              ))}
            </ul>
          ) : <p className="empty-state">No recent users.</p>}
        </div>

        <div className="admin-panel">
          <h2>Recent Vehicles</h2>
          {loading ? <p>Loading…</p> : data.recentVehicles.length ? (
            <ul className="admin-list">
              {data.recentVehicles.map((vehicle) => (
                <li key={vehicle.id}>
                  <div>
                    <strong>{vehicle.vehicle_number}</strong>
                    <small>{vehicle.owner_name || "Unassigned"}</small>
                  </div>
                  <span className={`status-pill ${
                    vehicle.priority === "Emergency" || vehicle.priority === "High" ? "status-emergency" :
                    vehicle.priority === "Medium" ? "status-medium" : "status-low"
                  }`}>{vehicle.priority}</span>
                </li>
              ))}
            </ul>
          ) : <p className="empty-state">No recent vehicles.</p>}
        </div>

        <div className="admin-panel wide-panel">
          <h2>Recent Charging Sessions</h2>
          {loading ? <p>Loading…</p> : data.recentChargingSessions.length ? (
            <ul className="admin-list">
              {data.recentChargingSessions.map((session) => (
                <li key={session.id}>
                  <div>
                    <strong>Session #{session.id}</strong>
                    <small>{new Date(session.start_time).toLocaleString()}</small>
                  </div>
                  <span className={`status-pill ${
                    session.status === "charging" || session.status === "active" ? "status-active" :
                    session.status === "completed" ? "status-completed" :
                    session.status === "cancelled" ? "status-cancelled" : "status-scheduled"
                  }`}>{session.status}</span>
                </li>
              ))}
            </ul>
          ) : <p className="empty-state">No recent charging sessions.</p>}
        </div>
      </div>

      <div className="admin-links">
        <Link to="/admin/users">Manage users</Link>
        <Link to="/admin/vehicles">Manage vehicles</Link>
        <Link to="/admin/charging-sessions">Manage sessions</Link>
      </div>
    </section>
  );
}

export default AdminDashboard;
