import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./GridSlots.css";

function GridSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    slot_time: "",
    max_power_kw: "",
    current_load_kw: "",
    price_per_kwh: "",
  });

  const getSlotId = (slot) =>
    slot.slot_id ?? slot.id ?? slot.slotId;

  const getMaxPower = (slot) =>
    slot.max_power_kw ??
    slot.max_capacity_kw ??
    slot.maxPowerKw ??
    slot.maxPower;

  const getCurrentLoad = (slot) =>
    slot.current_load_kw ??
    slot.load_kw ??
    slot.currentLoadKw ??
    slot.currentLoad;

  const getPrice = (slot) =>
    slot.price_per_kwh ??
    slot.price ??
    slot.electricity_price ??
    slot.electricityPrice;

  const getSlotTime = (slot) =>
    slot.slot_time ??
    slot.time ??
    slot.start_time ??
    slot.startTime;

  const getUtilization = (slot) => {
    const maxPower = Number(getMaxPower(slot));
    const currentLoad = Number(getCurrentLoad(slot));

    if (!maxPower || Number.isNaN(currentLoad)) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((currentLoad / maxPower) * 100)
    );
  };

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/grid-slots");

      if (Array.isArray(data)) {
        setSlots(data);
      } else if (Array.isArray(data.gridSlots)) {
        setSlots(data.gridSlots);
      } else if (Array.isArray(data.slots)) {
        setSlots(data.slots);
      } else if (Array.isArray(data.data)) {
        setSlots(data.data);
      } else {
        setSlots([]);
      }
    } catch (err) {
      setError(err.message || "Unable to load grid slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setError("");

    await apiRequest("/api/grid-slots", {
      method: "POST",
      body: JSON.stringify({
        slot_time: formData.slot_time,
        max_capacity_kw: Number(formData.max_power_kw),
        electricity_price: Number(formData.price_per_kwh),
        current_load_kw: Number(formData.current_load_kw),
      }),
    });

    setFormData({
      slot_time: "",
      max_power_kw: "",
      current_load_kw: "",
      price_per_kwh: "",
    });

    setShowForm(false);
    await loadSlots();
  } catch (err) {
    setError(err.message || "Unable to create grid slot");
  }
};
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this grid slot?")) {
      return;
    }

    try {
      setError("");

      await apiRequest(`/api/grid-slots/${id}`, {
        method: "DELETE",
      });

      await loadSlots();
    } catch (err) {
      setError(err.message || "Unable to delete grid slot");
    }
  };

  const totalCapacity = slots.reduce(
    (total, slot) =>
      total + Number(getMaxPower(slot) || 0),
    0
  );

  const totalLoad = slots.reduce(
    (total, slot) =>
      total + Number(getCurrentLoad(slot) || 0),
    0
  );

  const averagePrice =
    slots.length > 0
      ? slots.reduce(
          (total, slot) =>
            total + Number(getPrice(slot) || 0),
          0
        ) / slots.length
      : 0;

  const overallLoad =
    totalCapacity > 0
      ? Math.round((totalLoad / totalCapacity) * 100)
      : 0;

  return (
    <main className="grid-slots-page">
      <header className="grid-slots-header">
        <div>
          <span className="grid-slots-label">
            SMART EV / GRID OPERATIONS
          </span>

          <h1>
            Grid <span>slots.</span>
          </h1>

          <p>
            Monitor transformer capacity, grid load,
            and time-of-use electricity pricing.
          </p>
        </div>

        <button
          className="add-slot-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "Add Grid Slot"} ↗
        </button>
      </header>

      {error && (
        <div className="grid-slots-error">
          {error}
        </div>
      )}

      <section className="grid-stats">
        <article className="grid-stat-card">
          <span>TOTAL SLOTS</span>
          <strong>{slots.length}</strong>
          <small>Configured grid periods</small>
        </article>

        <article className="grid-stat-card">
          <span>TOTAL CAPACITY</span>
          <strong>{totalCapacity}</strong>
          <small>kW available capacity</small>
        </article>

        <article className="grid-stat-card">
          <span>CURRENT LOAD</span>
          <strong>{totalLoad}</strong>
          <small>kW active demand</small>
        </article>

        <article className="grid-stat-card">
          <span>AVERAGE PRICE</span>
          <strong>
            {averagePrice.toFixed(2)}
          </strong>
          <small>Price per kWh</small>
        </article>
      </section>

      <section className="grid-overview">
        <div>
          <span className="section-label">
            01 — TRANSFORMER STATUS
          </span>

          <h2>Grid utilization</h2>

          <p>
            Current aggregate power consumption across
            configured grid slots.
          </p>
        </div>

        <div className="load-display">
          <strong>{overallLoad}%</strong>
          <span>UTILIZATION</span>

          <div className="load-bar">
            <div
              style={{
                width: `${overallLoad}%`,
              }}
            ></div>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="grid-form-section">
          <div className="form-heading">
            <span className="section-label">
              02 — NEW GRID SLOT
            </span>

            <h2>Configure slot</h2>
          </div>

          <form
            className="grid-slot-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="slot_time">
                SLOT TIME
              </label>

              <input
                id="slot_time"
                name="slot_time"
                type="datetime-local"
                value={formData.slot_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="max_power_kw">
                MAX POWER (KW)
              </label>

              <input
                id="max_power_kw"
                name="max_power_kw"
                type="number"
                min="0"
                step="0.1"
                placeholder="500"
                value={formData.max_power_kw}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="current_load_kw">
                CURRENT LOAD (KW)
              </label>

              <input
                id="current_load_kw"
                name="current_load_kw"
                type="number"
                min="0"
                step="0.1"
                placeholder="280"
                value={formData.current_load_kw}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price_per_kwh">
                PRICE / KWH
              </label>

              <input
                id="price_per_kwh"
                name="price_per_kwh"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.18"
                value={formData.price_per_kwh}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="save-slot-button"
            >
              Create Slot ↗
            </button>
          </form>
        </section>
      )}

      <section className="grid-table-section">
        <div className="table-heading">
          <div>
            <span className="section-label">
              03 — GRID SCHEDULE
            </span>

            <h2>Power slots</h2>
          </div>

          <span className="live-indicator">
            ● LIVE DATA
          </span>
        </div>

        {loading ? (
          <div className="grid-message">
            Loading grid slots...
          </div>
        ) : slots.length === 0 ? (
          <div className="grid-message">
            No grid slots found.
          </div>
        ) : (
          <div className="grid-table-wrapper">
            <table className="grid-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>CAPACITY</th>
                  <th>LOAD</th>
                  <th>UTILIZATION</th>
                  <th>PRICE / KWH</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {slots.map((slot) => {
                  const utilization =
                    getUtilization(slot);

                  return (
                    <tr key={getSlotId(slot)}>
                      <td>
                        {getSlotTime(slot) || "—"}
                      </td>

                      <td>
                        {getMaxPower(slot) ?? "—"} kW
                      </td>

                      <td>
                        {getCurrentLoad(slot) ?? "—"} kW
                      </td>

                      <td>
                        <div className="utilization-cell">
                          <span>
                            {utilization}%
                          </span>

                          <div className="mini-load-bar">
                            <div
                              style={{
                                width: `${utilization}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td>
                        {getPrice(slot) ?? "—"}
                      </td>

                      <td>
                        <button
                          className="delete-slot-button"
                          onClick={() =>
                            handleDelete(
                              getSlotId(slot)
                            )
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default GridSlots;