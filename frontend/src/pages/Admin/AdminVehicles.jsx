import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Admin.css";

function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const loadVehicles = async (nextPage = page, nextSearch = search, nextPriority = priorityFilter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(nextPage), limit: "10" });
      if (nextSearch) params.set("search", nextSearch);
      if (nextPriority !== "all") params.set("priority", nextPriority);
      const response = await apiRequest(`/api/admin/vehicles?${params.toString()}`);
      const payload = response.data || response;
      setVehicles(payload.vehicles || []);
      setPagination(payload.pagination || { page: nextPage, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Unable to load vehicles");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles(page, search, priorityFilter);
  }, [page, priorityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); loadVehicles(1, search, priorityFilter); }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      await apiRequest(`/api/admin/vehicles/${id}`, { method: "DELETE" });
      await loadVehicles(page, search, priorityFilter);
    } catch (err) {
      setError(err.message || "Unable to delete vehicle");
    }
  };

  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <span className="section-label">ADMIN / VEHICLES</span>
          <h1>Vehicle management</h1>
        </div>
      </header>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      <div className="admin-toolbar">
        <input type="search" placeholder="Search vehicle number" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All priorities</option>
          <option value="Emergency">Emergency</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      {loading ? <p>Loading vehicles…</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Vehicle</th><th>Owner</th><th>Battery</th><th>SOC</th><th>Priority</th><th>Arrival</th><th>Deadline</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.vehicle_number}</td>
                  <td>{vehicle.owner_name || vehicle.owner_email || "Unknown"}</td>
                  <td>{vehicle.battery_capacity_kwh} kWh</td>
                  <td>{vehicle.initial_soc}%</td>
                  <td><span className={`status-pill ${
                    vehicle.priority === "Emergency" || vehicle.priority === "High" ? "status-emergency" :
                    vehicle.priority === "Medium" ? "status-medium" : "status-low"
                  }`}>{vehicle.priority}</span></td>
                  <td>{new Date(vehicle.arrival_time).toLocaleString()}</td>
                  <td>{new Date(vehicle.deadline).toLocaleString()}</td>
                  <td><button className="text-button" type="button" onClick={() => handleDelete(vehicle.id)}>Delete</button></td>
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

export default AdminVehicles;
