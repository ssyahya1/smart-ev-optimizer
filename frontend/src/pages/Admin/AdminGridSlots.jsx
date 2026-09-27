import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Admin.css";

function AdminGridSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ slot_time: "", max_capacity_kw: "", electricity_price: "", current_load_kw: "" });

  const loadSlots = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/api/admin/grid-slots");
      setSlots(response.data || response);
    } catch (err) {
      setError(err.message || "Unable to load grid slots");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSlots(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/api/admin/grid-slots", {
        method: "POST",
        body: JSON.stringify({
          slot_time: form.slot_time,
          max_capacity_kw: Number(form.max_capacity_kw),
          electricity_price: Number(form.electricity_price),
          current_load_kw: Number(form.current_load_kw),
        }),
      });
      setForm({ slot_time: "", max_capacity_kw: "", electricity_price: "", current_load_kw: "" });
      await loadSlots();
    } catch (err) {
      setError(err.message || "Unable to create grid slot");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this grid slot?")) return;
    try {
      await apiRequest(`/api/admin/grid-slots/${id}`, { method: "DELETE" });
      await loadSlots();
    } catch (err) {
      setError(err.message || "Unable to delete grid slot");
    }
  };

  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <span className="section-label">ADMIN / GRID SLOTS</span>
          <h1>Grid slots</h1>
        </div>
      </header>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label>Slot time<input type="datetime-local" value={form.slot_time} onChange={(e) => setForm({ ...form, slot_time: e.target.value })} required /></label>
          <label>Max capacity kW<input type="number" value={form.max_capacity_kw} onChange={(e) => setForm({ ...form, max_capacity_kw: e.target.value })} required /></label>
          <label>Price<input type="number" step="0.01" value={form.electricity_price} onChange={(e) => setForm({ ...form, electricity_price: e.target.value })} required /></label>
          <label>Current load kW<input type="number" value={form.current_load_kw} onChange={(e) => setForm({ ...form, current_load_kw: e.target.value })} required /></label>
        </div>
        <button className="admin-primary-button" type="submit">Add slot</button>
      </form>
      {loading ? <p>Loading grid slots…</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Slot time</th><th>Max capacity</th><th>Price</th><th>Current load</th><th>Actions</th></tr></thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}><td>{new Date(slot.slot_time).toLocaleString()}</td><td>{slot.max_capacity_kw} kW</td><td>{slot.electricity_price}</td><td>{slot.current_load_kw} kW</td><td><button className="text-button" type="button" onClick={() => handleDelete(slot.id)}>Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminGridSlots;
