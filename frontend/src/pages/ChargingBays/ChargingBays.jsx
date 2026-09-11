
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";
import "./ChargingBays.css";

function ChargingBays() {
  const [bays, setBays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    bay_number: "",
    charger_type: "AC",
    max_power_kw: "",
    status: "available",
  });

  const loadBays = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/charging-bays");

      if (Array.isArray(data)) {
        setBays(data);
      } else if (Array.isArray(data.chargingBays)) {
        setBays(data.chargingBays);
      } else if (Array.isArray(data.bays)) {
        setBays(data.bays);
      } else if (Array.isArray(data.data)) {
        setBays(data.data);
      } else {
        setBays([]);
      }
    } catch (err) {
      setError(err.message || "Unable to load charging bays");
      setBays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBays();
  }, []);

  const stats = useMemo(() => {
    const total = bays.length;

    const charging = bays.filter(
      (bay) => String(bay.status || "").toLowerCase() === "occupied"
    ).length;

    const available = bays.filter(
      (bay) => String(bay.status || "").toLowerCase() === "available"
    ).length;

    const fastChargers = bays.filter(
      (bay) => String(bay.charger_type || "").toLowerCase() === "dc"
    ).length;

    return {
      total,
      charging,
      available,
      fastChargers,
    };
  }, [bays]);

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

      await apiRequest("/api/charging-bays", {
        method: "POST",
        body: JSON.stringify({
          bay_number: formData.bay_number.trim(),
          charger_type: formData.charger_type,
          max_power_kw: Number(formData.max_power_kw),
          status: formData.status,
        }),
      });

      setFormData({
        bay_number: "",
        charger_type: "AC",
        max_power_kw: "",
        status: "available",
      });

      setShowForm(false);

      await loadBays();
    } catch (err) {
      setError(err.message || "Unable to create charging bay");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this charging bay?")) {
      return;
    }

    try {
      setError("");

      await apiRequest(`/api/charging-bays/${id}`, {
        method: "DELETE",
      });

      await loadBays();
    } catch (err) {
      setError(err.message || "Unable to delete charging bay");
    }
  };

  const getBayId = (bay) => {
    return bay.bay_number || bay.bay_id || bay.id || "—";
  };

  const getChargerType = (bay) => {
    const type = String(
      bay.charger_type || bay.chargerType || bay.type || ""
    ).toUpperCase();

    if (type === "DC") {
      return "DC Fast";
    }

    if (type === "AC") {
      return "AC";
    }

    return type || "—";
  };

  const getPower = (bay) => {
    const power =
      bay.max_power_kw ??
      bay.power_kw ??
      bay.power ??
      bay.maxPower;

    return power !== undefined && power !== null
      ? `${power} kW`
      : "—";
  };

  const getStatus = (bay) => {
    const status = String(bay.status || "available").toLowerCase();

    if (status === "occupied") {
      return "Occupied";
    }

    if (status === "maintenance") {
      return "Maintenance";
    }

    return "Available";
  };

  return (
    <section className="charging-bays-page">
      <header className="charging-bays-header">
        <div>
          <span className="charging-bays-label">
            SMART EV / INFRASTRUCTURE
          </span>

          <h1>
            Charging <span>bays.</span>
          </h1>

          <p>
            Monitor charger availability, power capacity, and bay utilization
            across the EV fleet.
          </p>
        </div>

        <button
          className="add-bay-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close" : "Add Bay"}
          <span>{showForm ? "×" : "↗"}</span>
        </button>
      </header>

      <div className="charging-bays-divider"></div>

      {error && <div className="charging-bays-error">{error}</div>}

      <div className="bay-stats">
        <article className="bay-stat-card">
          <span>TOTAL BAYS</span>
          <strong>{stats.total}</strong>
          <small>Installed charging infrastructure</small>
        </article>

        <article className="bay-stat-card">
          <span>OCCUPIED</span>
          <strong>{stats.charging}</strong>
          <small>Currently occupied</small>
        </article>

        <article className="bay-stat-card">
          <span>AVAILABLE</span>
          <strong>{stats.available}</strong>
          <small>Ready for assignment</small>
        </article>

        <article className="bay-stat-card">
          <span>DC FAST</span>
          <strong>{stats.fastChargers}</strong>
          <small>High-power charging bays</small>
        </article>
      </div>

      {showForm && (
        <section className="bay-form-card">
          <div className="bay-form-heading">
            <div>
              <span className="section-label">NEW INFRASTRUCTURE</span>

              <h2>Add charging bay</h2>
            </div>

            <span>01 / BAY</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bay-form-grid">
              <div className="bay-form-group">
                <label>BAY NUMBER</label>

                <input
                  name="bay_number"
                  value={formData.bay_number}
                  onChange={handleChange}
                  placeholder="BAY-01"
                  maxLength="50"
                  required
                />
              </div>

              <div className="bay-form-group">
                <label>CHARGER TYPE</label>

                <select
                  name="charger_type"
                  value={formData.charger_type}
                  onChange={handleChange}
                  required
                >
                  <option value="AC">AC</option>
                  <option value="DC">DC</option>
                </select>
              </div>

              <div className="bay-form-group">
                <label>POWER LIMIT (KW)</label>

                <input
                  name="max_power_kw"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.max_power_kw}
                  onChange={handleChange}
                  placeholder="22"
                  required
                />
              </div>

              <div className="bay-form-group">
                <label>STATUS</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <button type="submit" className="save-bay-button">
              Create Charging Bay
              <span>↗</span>
            </button>
          </form>
        </section>
      )}

      <section className="bays-table-section">
        <div className="bays-table-heading">
          <div>
            <span className="section-label">
              01 — CHARGING INFRASTRUCTURE
            </span>

            <h2>Bay operations</h2>
          </div>

          <span className="bay-count">
            {bays.length.toString().padStart(2, "0")} BAYS
          </span>
        </div>

        {loading ? (
          <div className="bays-state">
            <span>LOADING BAY DATA...</span>
          </div>
        ) : bays.length === 0 ? (
          <div className="bays-state">
            <span>NO CHARGING BAYS FOUND</span>

            <p>
              Add your first charging bay to begin infrastructure management.
            </p>
          </div>
        ) : (
          <div className="bays-table-wrapper">
            <table className="bays-table">
              <thead>
                <tr>
                  <th>BAY</th>
                  <th>STATUS</th>
                  <th>CHARGER</th>
                  <th>POWER LIMIT</th>
                  <th>VEHICLE</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {bays.map((bay) => (
                  <tr key={bay.id || bay.bay_number || bay.bay_id}>
                    <td>
                      <div className="bay-name">
                        <span className="bay-indicator"></span>

                        <strong>{getBayId(bay)}</strong>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`bay-status ${getStatus(bay)
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        ● {getStatus(bay)}
                      </span>
                    </td>

                    <td>{getChargerType(bay)}</td>

                    <td>
                      <strong className="power-value">
                        {getPower(bay)}
                      </strong>
                    </td>

                    <td>—</td>

                    <td>
                      <button
                        className="delete-bay-button"
                        onClick={() =>
                          handleDelete(bay.id || bay.bay_id)
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

export default ChargingBays;