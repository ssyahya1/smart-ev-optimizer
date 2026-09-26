import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import "./DashboardOverview.css";

const getRows = (response, ...keys) => {
  if (Array.isArray(response)) return response;
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }
  return Array.isArray(response?.data) ? response.data : [];
};

function DashboardOverview() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    vehicles: [],
    bays: [],
    slots: [],
    sessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiRequest("/api/vehicles"),
      apiRequest("/api/charging-bays"),
      apiRequest("/api/grid-slots"),
      apiRequest("/api/charging-sessions"),
    ])
      .then(([vehicles, bays, slots, sessions]) => {
        if (!isMounted) return;
        setSummary({
          vehicles: getRows(vehicles, "vehicles"),
          bays: getRows(bays, "chargingBays", "bays"),
          slots: getRows(slots, "gridSlots", "slots"),
          sessions: getRows(sessions, "chargingSessions", "sessions"),
        });
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message || "We couldn't load your fleet overview.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeSessions = summary.sessions.filter((session) =>
    ["charging", "active", "in progress", "in_progress"].includes(
      String(session.status || "").toLowerCase()
    )
  );
  const availableBays = summary.bays.filter(
    (bay) => String(bay.status || "").toLowerCase() === "available"
  ).length;
  const totalEnergy = summary.sessions.reduce(
    (total, session) =>
      total + Number(session.energy_delivered_kwh ?? session.energy_kwh ?? session.energy ?? 0),
    0
  );
  const displayName = user?.name || user?.full_name || user?.email || "there";
  const recentSessions = [...activeSessions].slice(0, 4);

  return (
    <section className="overview-page" aria-busy={loading}>
      <header className="overview-header">
        <div>
          <span className="overview-eyebrow">FLEET OVERVIEW</span>
          <h1>Good day, {String(displayName).split(" ")[0]}</h1>
          <p>Here’s the latest on your vehicles and charging site.</p>
        </div>
        <Link className="overview-primary-action" to="/sessions">+ New charging session</Link>
      </header>

      {error && (
        <div className="overview-alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => window.location.reload()}>Try again</button>
        </div>
      )}

      <section className="overview-metrics" aria-label="Fleet summary">
        <article className="overview-metric">
          <span>Vehicles in fleet</span>
          <strong>{loading ? "—" : summary.vehicles.length}</strong>
          <small>Registered vehicles</small>
        </article>
        <article className="overview-metric overview-metric-highlight">
          <span>Charging now</span>
          <strong>{loading ? "—" : activeSessions.length}</strong>
          <small>{activeSessions.length === 1 ? "active session" : "active sessions"}</small>
        </article>
        <article className="overview-metric">
          <span>Bays available</span>
          <strong>{loading ? "—" : availableBays}</strong>
          <small>Ready to use</small>
        </article>
        <article className="overview-metric">
          <span>Energy delivered</span>
          <strong>{loading ? "—" : totalEnergy.toFixed(1)} {!loading && <small>kWh</small>}</strong>
          <small>Across all sessions</small>
        </article>
      </section>

      <section className="overview-main-grid">
        <div className="overview-panel overview-sessions">
          <div className="overview-panel-heading">
            <div>
              <span className="overview-eyebrow">LIVE ACTIVITY</span>
              <h2>Charging right now</h2>
            </div>
            <Link to="/sessions">All sessions <span aria-hidden="true">→</span></Link>
          </div>
          {loading ? (
            <p className="overview-empty">Loading current sessions…</p>
          ) : recentSessions.length ? (
            <div className="overview-session-list">
              {recentSessions.map((session, index) => {
                const energy = Number(session.energy_delivered_kwh ?? session.energy_kwh ?? session.energy ?? 0);
                const vehicle = session.vehicle?.vehicle_number ?? session.vehicle_number ?? session.vehicle_id;
                const bay = session.bay?.bay_number ?? session.bay_number ?? session.charging_bay_id ?? session.bay_id;
                return (
                  <article className="overview-session-row" key={session.session_id ?? session.id ?? index}>
                    <span className="overview-session-indicator" aria-hidden="true" />
                    <div className="overview-session-detail">
                      <strong>{vehicle ? `Vehicle ${vehicle}` : "Active vehicle"}</strong>
                      <span>{bay ? `Bay ${bay}` : "Bay assigned"}</span>
                    </div>
                    <div className="overview-session-energy">
                      <strong>{energy.toFixed(1)} kWh</strong>
                      <span>delivered</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="overview-empty-state">
              <span className="overview-empty-mark" aria-hidden="true">+</span>
              <strong>No vehicles are charging</strong>
              <p>Start a session when a vehicle is ready to charge.</p>
              <Link to="/sessions">View charging sessions</Link>
            </div>
          )}
        </div>

        <aside className="overview-panel overview-site-panel">
          <span className="overview-eyebrow">SITE SNAPSHOT</span>
          <h2>Your charging site</h2>
          <div className="overview-site-stat">
            <span>Charging bays</span>
            <strong>{loading ? "—" : summary.bays.length}</strong>
          </div>
          <div className="overview-site-stat">
            <span>Available bays</span>
            <strong>{loading ? "—" : availableBays}</strong>
          </div>
          <div className="overview-site-stat">
            <span>Energy time slots</span>
            <strong>{loading ? "—" : summary.slots.length}</strong>
          </div>
          <Link to="/bays" className="overview-text-link">View bay availability <span aria-hidden="true">→</span></Link>
        </aside>
      </section>

      <section className="overview-next-step">
        <div>
          <span className="overview-eyebrow">NEXT STEP</span>
          <h2>Keep your fleet moving</h2>
          <p>Check bay availability or add a vehicle before its next charge.</p>
        </div>
        <div className="overview-next-links">
          <Link to="/bays">Check charging bays <span aria-hidden="true">→</span></Link>
          <Link to="/vehicles">Manage vehicles <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </section>
  );
}

export default DashboardOverview;
