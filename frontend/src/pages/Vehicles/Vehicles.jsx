
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Vehicles.css";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    vehicle_number: "",
    arrival_time: "",
    initial_soc: "",
    battery_capacity_kwh: "",
    priority: "Medium",
    deadline: "",
  });

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/vehicles");

      if (Array.isArray(data)) {
        setVehicles(data);
      } else if (Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
      } else if (Array.isArray(data.data)) {
        setVehicles(data.data);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      setError(err.message || "Unable to load vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = () => {
      void loadVehicles();
    };

    queueMicrotask(load);
  }, [loadVehicles]);

  const stats = useMemo(() => {
    const total = vehicles.length;

    const highPriority = vehicles.filter((vehicle) =>
      ["emergency", "high"].includes(
        String(vehicle.priority || "").toLowerCase()
      )
    ).length;

    const averageSoc = total
      ? vehicles.reduce(
          (sum, vehicle) => sum + Number(vehicle.initial_soc || 0),
          0
        ) / total
      : 0;

    const vehiclesWithDeadlines = vehicles.filter(
      (vehicle) => vehicle.deadline
    ).length;

    return {
      total,
      highPriority,
      averageSoc,
      vehiclesWithDeadlines,
    };
  }, [vehicles]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      await apiRequest("/api/vehicles/registervehicle", {
        method: "POST",
        body: JSON.stringify({
          vehicle_number: formData.vehicle_number,
          arrival_time: formData.arrival_time,
          initial_soc: Number(formData.initial_soc),
          battery_capacity_kwh: Number(formData.battery_capacity_kwh),
          priority: formData.priority,
          deadline: formData.deadline,
        }),
      });

      setFormData({
        vehicle_number: "",
        arrival_time: "",
        initial_soc: "",
        battery_capacity_kwh: "",
        priority: "Medium",
        deadline: "",
      });

      setShowForm(false);
      await loadVehicles();
    } catch (err) {
      setError(err.message || "Unable to create vehicle");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) {
      return;
    }

    try {
      setError("");

      await apiRequest(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      await loadVehicles();
    } catch (err) {
      setError(err.message || "Unable to delete vehicle");
    }
  };

  const getPriorityClass = (priority) => {
    return String(priority || "Medium").toLowerCase();
  };

  const getSoc = (vehicle) => {
    const value =
      vehicle.initial_soc ??
      vehicle.soc ??
      vehicle.state_of_charge ??
      0;

    return `${Number(value)}%`;
  };

  const getVehicleId = (vehicle) => {
    return (
      vehicle.vehicle_number ||
      vehicle.vehicle_id ||
      vehicle.id ||
      vehicle.vehicleId ||
      "—"
    );
  };

  const getBattery = (vehicle) => {
    const value =
      vehicle.battery_capacity_kwh ??
      vehicle.battery_capacity ??
      vehicle.battery_kwh ??
      vehicle.batteryCapacity;

    return value !== undefined && value !== null
      ? `${value} kWh`
      : "—";
  };

  return (
    <section className="vehicles-page">
      <div className="vehicles-header">
        <div>
          <span className="vehicles-label">
            SMART EV / FLEET
          </span>

          <h1>
            Vehicles <span>overview.</span>
          </h1>

          <p>
            Monitor fleet availability, battery state, priority,
            and charging requirements from one control surface.
          </p>
        </div>

        <button
          className="add-vehicle-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close" : "Add Vehicle"}
          <span>{showForm ? "×" : "↗"}</span>
        </button>
      </div>

      <div className="vehicles-divider"></div>

      {error && (
        <div className="vehicles-error">
          {error}
        </div>
      )}

      <div className="vehicle-stats">
        <article className="vehicle-stat-card">
          <span>TOTAL VEHICLES</span>
          <strong>{stats.total}</strong>
          <small>Registered fleet</small>
        </article>

        <article className="vehicle-stat-card">
          <span>HIGH PRIORITY</span>
          <strong>{stats.highPriority}</strong>
          <small>Emergency / high priority</small>
        </article>

        <article className="vehicle-stat-card">
          <span>AVERAGE SOC</span>
          <strong>{stats.averageSoc.toFixed(1)}%</strong>
          <small>Initial state of charge</small>
        </article>

        <article className="vehicle-stat-card">
          <span>DEADLINES</span>
          <strong>{stats.vehiclesWithDeadlines}</strong>
          <small>Vehicles with deadlines</small>
        </article>
      </div>

      {showForm && (
        <section className="vehicle-form-card">
          <div className="form-heading">
            <div>
              <span className="section-label">
                NEW VEHICLE
              </span>

              <h2>Add fleet vehicle</h2>
            </div>

            <span>01 / VEHICLE</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="vehicle-form-grid">
              <div className="vehicle-form-group">
                <label>VEHICLE ID</label>

                <input
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  placeholder="EV-001"
                  required
                />
              </div>

              <div className="vehicle-form-group">
                <label>ARRIVAL TIME</label>

                <input
                  name="arrival_time"
                  type="datetime-local"
                  value={formData.arrival_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="vehicle-form-group">
                <label>INITIAL SOC (%)</label>

                <input
                  name="initial_soc"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.initial_soc}
                  onChange={handleChange}
                  placeholder="40"
                  required
                />
              </div>

              <div className="vehicle-form-group">
                <label>BATTERY CAPACITY (KWH)</label>

                <input
                  name="battery_capacity_kwh"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.battery_capacity_kwh}
                  onChange={handleChange}
                  placeholder="75"
                  required
                />
              </div>

              <div className="vehicle-form-group">
                <label>PRIORITY</label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Emergency">Emergency</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="vehicle-form-group">
                <label>DEADLINE</label>

                <input
                  name="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="save-vehicle-button"
            >
              Create Vehicle
              <span>↗</span>
            </button>
          </form>
        </section>
      )}

      <section className="vehicles-table-section">
        <div className="table-heading">
          <div>
            <span className="section-label">
              01 — FLEET REGISTER
            </span>

            <h2>Vehicle operations</h2>
          </div>

          <span className="vehicle-count">
            {vehicles.length.toString().padStart(2, "0")} VEHICLES
          </span>
        </div>

        {loading ? (
          <div className="vehicles-state">
            <span>LOADING FLEET DATA...</span>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="vehicles-state">
            <span>NO VEHICLES FOUND</span>
            <p>Add your first vehicle to begin fleet optimization.</p>
          </div>
        ) : (
          <div className="vehicles-table-wrapper">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>VEHICLE</th>
                  <th>SOC</th>
                  <th>BATTERY</th>
                  <th>PRIORITY</th>
                  <th>ARRIVAL</th>
                  <th>DEADLINE</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id || vehicle.vehicle_number}>
                    <td>
                      <div className="vehicle-name">
                        <span className="vehicle-indicator"></span>

                        <strong>
                          {getVehicleId(vehicle)}
                        </strong>
                      </div>
                    </td>

                    <td>
                      <strong className="soc-value">
                        {getSoc(vehicle)}
                      </strong>
                    </td>

                    <td>{getBattery(vehicle)}</td>

                    <td>
                      <span
                        className={`priority-badge ${getPriorityClass(
                          vehicle.priority
                        )}`}
                      >
                        {vehicle.priority || "Medium"}
                      </span>
                    </td>

                    <td>
                      {vehicle.arrival_time
                        ? new Date(
                            vehicle.arrival_time
                          ).toLocaleString()
                        : "—"}
                    </td>

                    <td>
                      {vehicle.deadline
                        ? new Date(
                            vehicle.deadline
                          ).toLocaleString()
                        : "—"}
                    </td>

                    <td>
                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(vehicle.id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default Vehicles;