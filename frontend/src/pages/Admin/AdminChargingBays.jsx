import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Admin.css";

function AdminChargingBays() {
  const [bays, setBays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ bay_number: "", charger_type: "AC", max_power_kw: "", status: "available" });

  const loadBays = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/api/admin/charging-bays");
      setBays(response.data || response);
    } catch (err) {
      setError(err.message || "Unable to load bays");
      setBays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBays(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/api/admin/charging-bays", {
        method: "POST",
        body: JSON.stringify({ ...form, max_power_kw: Number(form.max_power_kw) }),
      });
      setForm({ bay_number: "", charger_type: "AC", max_power_kw: "", status: "available" });
      await loadBays();
    } catch (err) {
      setError(err.message || "Unable to create bay");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this charging bay?")) return;
    try {
      await apiRequest(`/api/admin/charging-bays/${id}`, { method: "DELETE" });
      await loadBays();
    } catch (err) {
      setError(err.message || "Unable to delete bay");
    }
  };

  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <span className="section-label">ADMIN / BAYS</span>
          <h1>Charging bays</h1>
        </div>
      </header>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label>Bay number<input value={form.bay_number} onChange={(e) => setForm({ ...form, bay_number: e.target.value })} required /></label>
          <label>Type<select value={form.charger_type} onChange={(e) => setForm({ ...form, charger_type: e.target.value })}><option value="AC">AC</option><option value="DC">DC</option></select></label>
          <label>Max power kW<input type="number" value={form.max_power_kw} onChange={(e) => setForm({ ...form, max_power_kw: e.target.value })} required /></label>
          <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="available">available</option><option value="occupied">occupied</option><option value="maintenance">maintenance</option></select></label>
        </div>
        <button className="admin-primary-button" type="submit">Add bay</button>
      </form>
      {loading ? <p>Loading bays…</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Bay</th><th>Type</th><th>Power</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {bays.map((bay) => (
                <tr key={bay.id}><td>{bay.bay_number}</td><td>{bay.charger_type}</td><td>{bay.max_power_kw} kW</td><td><span className={`status-pill ${
                  bay.status === "available" ? "status-available" :
                  bay.status === "occupied" ? "status-occupied" : "status-maintenance"
                }`}>{bay.status}</span></td><td><button className="text-button" type="button" onClick={() => handleDelete(bay.id)}>Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminChargingBays;
