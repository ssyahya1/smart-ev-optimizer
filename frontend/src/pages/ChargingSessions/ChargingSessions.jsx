import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./ChargingSessions.css";

function ChargingSessions() {
  const [sessions, setSessions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bays, setBays] = useState([]);
  const [gridSlots, setGridSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    vehicle_id: "",
    charging_bay_id: "",
    grid_slot_id: "",
    start_time: "",
    end_time: "",
    energy_delivered_kwh: "",
    power_kw: "",
    status: "scheduled",
  });

  const getSessionId = (session) =>
    session.session_id ??
    session.id ??
    session.sessionId;

  const getVehicleId = (session) =>
    session.vehicle_id ??
    session.vehicleId ??
    session.vehicle?.vehicle_id ??
    session.vehicle?.id;

  const getBayId = (session) =>
    session.charging_bay_id ??
    session.bay_id ??
    session.bayId ??
    session.bay?.charging_bay_id ??
    session.bay?.bay_id ??
    session.bay?.id;

  const getGridSlotId = (session) =>
    session.grid_slot_id ??
    session.gridSlotId;

  const getStartTime = (session) =>
    session.start_time ??
    session.startTime;

  const getEndTime = (session) =>
    session.end_time ??
    session.endTime;

  const getEnergy = (session) =>
    session.energy_delivered_kwh ??
    session.energy_kwh ??
    session.energyKwh ??
    session.energy;

  const getPower = (session) =>
    session.power_kw ??
    session.current_power_kw ??
    session.powerKw ??
    session.power;

  const getStatus = (session) =>
    session.status ?? "unknown";

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        sessionData,
        vehicleData,
        bayData,
        gridSlotData,
      ] = await Promise.all([
        apiRequest("/api/charging-sessions"),
        apiRequest("/api/vehicles"),
        apiRequest("/api/charging-bays"),
        apiRequest("/api/grid-slots"),
      ]);

      if (Array.isArray(sessionData)) {
        setSessions(sessionData);
      } else if (Array.isArray(sessionData.chargingSessions)) {
        setSessions(sessionData.chargingSessions);
      } else if (Array.isArray(sessionData.sessions)) {
        setSessions(sessionData.sessions);
      } else if (Array.isArray(sessionData.data)) {
        setSessions(sessionData.data);
      } else {
        setSessions([]);
      }

      if (Array.isArray(vehicleData)) {
        setVehicles(vehicleData);
      } else if (Array.isArray(vehicleData.vehicles)) {
        setVehicles(vehicleData.vehicles);
      } else if (Array.isArray(vehicleData.data)) {
        setVehicles(vehicleData.data);
      } else {
        setVehicles([]);
      }

      if (Array.isArray(bayData)) {
        setBays(bayData);
      } else if (Array.isArray(bayData.chargingBays)) {
        setBays(bayData.chargingBays);
      } else if (Array.isArray(bayData.bays)) {
        setBays(bayData.bays);
      } else if (Array.isArray(bayData.data)) {
        setBays(bayData.data);
      } else {
        setBays([]);
      }

      if (Array.isArray(gridSlotData)) {
        setGridSlots(gridSlotData);
      } else if (Array.isArray(gridSlotData.gridSlots)) {
        setGridSlots(gridSlotData.gridSlots);
      } else if (Array.isArray(gridSlotData.data)) {
        setGridSlots(gridSlotData.data);
      } else {
        setGridSlots([]);
      }
    } catch (err) {
      setError(
        err.message || "Unable to load charging sessions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

      await apiRequest("/api/charging-sessions", {
        method: "POST",
        body: JSON.stringify({
          vehicle_id: Number(formData.vehicle_id),
          charging_bay_id: Number(formData.charging_bay_id),
          grid_slot_id: formData.grid_slot_id
            ? Number(formData.grid_slot_id)
            : null,
          start_time: formData.start_time,
          end_time: formData.end_time || null,
          power_kw: Number(formData.power_kw),
          energy_delivered_kwh: Number(
            formData.energy_delivered_kwh
          ),
          status: formData.status,
        }),
      });

      setFormData({
        vehicle_id: "",
        charging_bay_id: "",
        grid_slot_id: "",
        start_time: "",
        end_time: "",
        energy_delivered_kwh: "",
        power_kw: "",
        status: "scheduled",
      });

      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(
        err.message || "Unable to create charging session"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this charging session?")) {
      return;
    }

    try {
      setError("");

      await apiRequest(`/api/charging-sessions/${id}`, {
        method: "DELETE",
      });

      await loadData();
    } catch (err) {
      setError(
        err.message || "Unable to delete charging session"
      );
    }
  };

  const activeSessions = sessions.filter(
    (session) =>
      String(getStatus(session)).toLowerCase() === "charging"
  );

  const completedSessions = sessions.filter(
    (session) =>
      String(getStatus(session)).toLowerCase() ===
      "completed"
  );

  const totalEnergy = sessions.reduce(
    (total, session) =>
      total + Number(getEnergy(session) || 0),
    0
  );

  const totalPower = activeSessions.reduce(
    (total, session) =>
      total + Number(getPower(session) || 0),
    0
  );

  const getVehicleLabel = (id) => {
    const vehicle = vehicles.find(
      (item) =>
        String(
          item.vehicle_id ??
          item.id ??
          item.vehicleId
        ) === String(id)
    );

    return (
      vehicle?.vehicle_number ??
      vehicle?.vehicle_id ??
      vehicle?.id ??
      id ??
      "—"
    );
  };

  const getBayLabel = (id) => {
    const bay = bays.find(
      (item) =>
        String(item.id) === String(id)
    );

    return (
      bay?.bay_number ??
      id ??
      "—"
    );
  };

  const getGridSlotLabel = (id) => {
    if (!id) {
      return "No grid slot";
    }

    const slot = gridSlots.find(
      (item) =>
        String(item.id) === String(id)
    );

    return (
      slot?.slot_time ??
      slot?.id ??
      id
    );
  };

  return (
    <main className="charging-sessions-page">
      <header className="charging-sessions-header">
        <div>
          <span className="charging-sessions-label">
            SMART EV / CHARGING OPERATIONS
          </span>

          <h1>
            Charging <span>sessions.</span>
          </h1>

          <p>
            Monitor active charging activity, power usage,
            energy delivery, and session performance.
          </p>
        </div>

        <button
          className="add-session-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "New Session"} ↗
        </button>
      </header>

      {error && (
        <div className="sessions-error">
          {error}
        </div>
      )}

      <section className="session-stats">
        <article className="session-stat-card">
          <span>TOTAL SESSIONS</span>
          <strong>{sessions.length}</strong>
          <small>Recorded charging sessions</small>
        </article>

        <article className="session-stat-card">
          <span>ACTIVE NOW</span>
          <strong>{activeSessions.length}</strong>
          <small>Currently charging</small>
        </article>

        <article className="session-stat-card">
          <span>ACTIVE POWER</span>
          <strong>{totalPower.toFixed(1)}</strong>
          <small>kW current draw</small>
        </article>

        <article className="session-stat-card">
          <span>ENERGY DELIVERED</span>
          <strong>{totalEnergy.toFixed(1)}</strong>
          <small>kWh across sessions</small>
        </article>
      </section>

      <section className="session-overview">
        <div>
          <span className="section-label">
            01 — SESSION MONITOR
          </span>

          <h2>Charging activity</h2>

          <p>
            Real-time overview of vehicles currently
            connected to the charging infrastructure.
          </p>
        </div>

        <div className="activity-summary">
          <div>
            <strong>{activeSessions.length}</strong>
            <span>ACTIVE</span>
          </div>

          <div>
            <strong>{completedSessions.length}</strong>
            <span>COMPLETED</span>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="session-form-section">
          <div className="form-heading">
            <span className="section-label">
              02 — NEW SESSION
            </span>

            <h2>Start charging session</h2>
          </div>

          <form
            className="session-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="vehicle_id">
                VEHICLE
              </label>

              <select
                id="vehicle_id"
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select vehicle
                </option>

                {vehicles.map((vehicle) => {
                  const id =
                    vehicle.vehicle_id ??
                    vehicle.id ??
                    vehicle.vehicleId;

                  return (
                    <option key={id} value={id}>
                      {vehicle.vehicle_number ??
                        vehicle.vehicle_id ??
                        id}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="charging_bay_id">
                CHARGING BAY
              </label>

              <select
                id="charging_bay_id"
                name="charging_bay_id"
                value={formData.charging_bay_id}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select bay
                </option>

                {bays.map((bay) => {
                  const id = bay.id;

                  return (
                    <option key={id} value={id}>
                      {bay.bay_number} —{" "}
                      {bay.charger_type} —{" "}
                      {bay.max_power_kw} kW
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="grid_slot_id">
                GRID SLOT
              </label>

              <select
                id="grid_slot_id"
                name="grid_slot_id"
                value={formData.grid_slot_id}
                onChange={handleChange}
              >
                <option value="">
                  No grid slot
                </option>

                {gridSlots.map((slot) => {
                  const id = slot.id;

                  return (
                    <option key={id} value={id}>
                      {slot.slot_time} —{" "}
                      {slot.max_capacity_kw} kW — $
                      {slot.electricity_price}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="start_time">
                START TIME
              </label>

              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">
                END TIME
              </label>

              <input
                id="end_time"
                name="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="energy_delivered_kwh">
                ENERGY (KWH)
              </label>

              <input
                id="energy_delivered_kwh"
                name="energy_delivered_kwh"
                type="number"
                min="0"
                step="0.1"
                placeholder="25"
                value={formData.energy_delivered_kwh}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="power_kw">
                POWER (KW)
              </label>

              <input
                id="power_kw"
                name="power_kw"
                type="number"
                min="0"
                step="0.1"
                placeholder="22"
                value={formData.power_kw}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">
                STATUS
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="scheduled">
                  Scheduled
                </option>

                <option value="charging">
                  Charging
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="save-session-button"
            >
              Create Session ↗
            </button>
          </form>
        </section>
      )}

      <section className="sessions-table-section">
        <div className="table-heading">
          <div>
            <span className="section-label">
              03 — SESSION LOG
            </span>

            <h2>Charging sessions</h2>
          </div>

          <span className="live-indicator">
            ● LIVE DATA
          </span>
        </div>

        {loading ? (
          <div className="sessions-message">
            Loading charging sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="sessions-message">
            No charging sessions found.
          </div>
        ) : (
          <div className="sessions-table-wrapper">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>VEHICLE</th>
                  <th>BAY</th>
                  <th>GRID SLOT</th>
                  <th>START</th>
                  <th>END</th>
                  <th>ENERGY</th>
                  <th>POWER</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {sessions.map((session) => {
                  const status = String(
                    getStatus(session)
                  ).toLowerCase();

                  return (
                    <tr key={getSessionId(session)}>
                      <td>
                        {getVehicleLabel(
                          getVehicleId(session)
                        )}
                      </td>

                      <td>
                        {getBayLabel(
                          getBayId(session)
                        )}
                      </td>

                      <td>
                        {getGridSlotLabel(
                          getGridSlotId(session)
                        )}
                      </td>

                      <td>
                        {getStartTime(session) || "—"}
                      </td>

                      <td>
                        {getEndTime(session) || "—"}
                      </td>

                      <td>
                        {getEnergy(session) ?? "—"} kWh
                      </td>

                      <td>
                        {getPower(session) ?? "—"} kW
                      </td>

                      <td>
                        <span
                          className={`session-status status-${status}`}
                        >
                          {getStatus(session)}
                        </span>
                      </td>

                      <td>
                        <button
                          className="delete-session-button"
                          onClick={() =>
                            handleDelete(
                              getSessionId(session)
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

export default ChargingSessions;
