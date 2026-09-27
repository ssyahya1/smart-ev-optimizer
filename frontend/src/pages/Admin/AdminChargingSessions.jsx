import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Admin.css";

function AdminChargingSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const loadSessions = async (nextPage = page, nextStatus = statusFilter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(nextPage), limit: "10" });
      if (nextStatus !== "all") params.set("status", nextStatus);
      const response = await apiRequest(`/api/admin/charging-sessions?${params.toString()}`);
      const payload = response.data || response;
      setSessions(payload.chargingSessions || []);
      setPagination(payload.pagination || { page: nextPage, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Unable to load charging sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions(page, statusFilter);
  }, [page, statusFilter]);

  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <span className="section-label">ADMIN / SESSIONS</span>
          <h1>Charging sessions</h1>
        </div>
      </header>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      <div className="admin-toolbar">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="scheduled">scheduled</option>
          <option value="charging">charging</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>
      {loading ? <p>Loading sessions…</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Vehicle</th><th>Owner</th><th>Bay</th><th>Start</th><th>End</th><th>Power</th><th>Energy</th><th>Status</th></tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.vehicle_number || session.vehicle_id}</td>
                  <td>{session.user_name || session.user_email || "Unknown"}</td>
                  <td>{session.bay_number || session.charging_bay_id}</td>
                  <td>{new Date(session.start_time).toLocaleString()}</td>
                  <td>{session.end_time ? new Date(session.end_time).toLocaleString() : "—"}</td>
                  <td>{session.power_kw} kW</td>
                  <td>{session.energy_delivered_kwh} kWh</td>
                  <td><span className={`status-pill ${
                    session.status === "charging" || session.status === "active" ? "status-active" :
                    session.status === "completed" ? "status-completed" :
                    session.status === "cancelled" ? "status-cancelled" : "status-scheduled"
                  }`}>{session.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="admin-pagination">
        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
        <span>Page {pagination.page} / {pagination.totalPages}</span>
        <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
    </section>
  );
}

export default AdminChargingSessions;
