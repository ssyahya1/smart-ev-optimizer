
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Scheduling.css";

function Scheduling() {
  const [vehicles, setVehicles] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [result, setResult] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getVehicleId = (vehicle) =>
    vehicle.id ?? vehicle.vehicle_id ?? vehicle.vehicleId;

  const getSessionId = (session) =>
    session.id ?? session.session_id ?? session.charging_session_id;

  const getVehicle = (vehicleId) => {
    return vehicles.find(
      (vehicle) => Number(getVehicleId(vehicle)) === Number(vehicleId),
    );
  };

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [vehicleData, sessionData] = await Promise.all([
        apiRequest("/api/vehicles"),
        apiRequest("/api/charging-sessions"),
      ]);

      let loadedVehicles = [];
      let loadedSessions = [];

      if (Array.isArray(vehicleData)) {
        loadedVehicles = vehicleData;
      } else if (Array.isArray(vehicleData.vehicles)) {
        loadedVehicles = vehicleData.vehicles;
      } else if (Array.isArray(vehicleData.data)) {
        loadedVehicles = vehicleData.data;
      }

      if (Array.isArray(sessionData)) {
        loadedSessions = sessionData;
      } else if (Array.isArray(sessionData.chargingSessions)) {
        loadedSessions = sessionData.chargingSessions;
      } else if (Array.isArray(sessionData.data)) {
        loadedSessions = sessionData.data;
      }

      setVehicles(loadedVehicles);
      setSessions(loadedSessions);
    } catch (err) {
      setError(err.message || "Unable to load vehicles and charging sessions.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const buildJobs = () => {
    return sessions
      .map((session) => {
        const vehicle = getVehicle(session.vehicle_id);

        if (!vehicle) {
          return null;
        }

        return {
          id: Number(getSessionId(session)),
          vehicle_id: Number(session.vehicle_id),
          start_time: new Date(session.start_time).toISOString(),
          end_time: new Date(
            session.end_time || session.start_time,
          ).toISOString(),
          deadline: new Date(vehicle.deadline).toISOString(),
          priority: vehicle.priority,
        };
      })
      .filter(Boolean);
  };

  const runScheduling = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const chargingJobs = buildJobs();

      console.log("Charging Jobs Sent:", chargingJobs);

      if (chargingJobs.length === 0) {
        throw new Error(
          "No valid charging sessions are available for scheduling.",
        );
      }

      const data = await apiRequest("/api/scheduling", {
        method: "POST",
        body: JSON.stringify({
          chargingJobs,
        }),
      });

      console.log("Scheduling API result:", data);

      if (!data?.success) {
        throw new Error(data?.message || "Unable to prepare a charging schedule.");
      }

      setResult({
        success: true,

        greedy: {
          scheduled: data.greedy?.scheduledJobs ?? [],
          rejected: data.greedy?.unscheduledJobs ?? [],
          operations: data.greedy?.operations ?? 0,
        },

        dynamicProgramming: {
          scheduled: data.dynamicProgramming?.scheduled ?? [],
          rejected: data.dynamicProgramming?.unscheduled ?? [],
          totalPriorityValue:
            data.dynamicProgramming?.totalPriorityValue ?? 0,
          operations: data.dynamicProgramming?.operations ?? 0,
        },
      });
    } catch (err) {
      console.error("Scheduling error:", err);

      setError(err.message || "Unable to run charge scheduling.");
    } finally {
      setLoading(false);
    }
  };

  const greedy = result?.greedy;
  const dynamicProgramming = result?.dynamicProgramming;

  const greedyScheduled = greedy?.scheduled ?? greedy?.assignments ?? [];

  const greedyRejected = greedy?.rejected ?? [];

  const dpScheduled =
    dynamicProgramming?.scheduled ?? dynamicProgramming?.assignments ?? [];

  const dpRejected = dynamicProgramming?.rejected ?? [];

  const jobs = buildJobs();

  return (
    <main className="scheduling-page">
      <header className="scheduling-header">
        <div>
          <span className="scheduling-label">
            CHARGING / SESSION PLANNING
          </span>

          <h1>
            Charge <span>scheduling.</span>
          </h1>

          <p>
            Arrange charging sessions around vehicle priorities and ready-by times.
          </p>
        </div>

        <div className="scheduling-badge">
          <span>CHARGING PLAN</span>

          <strong>READY WHEN YOU ARE</strong>
        </div>
      </header>

      {error && <div className="scheduling-error">{error}</div>}

      <section className="scheduling-layout">
        <article className="scheduling-control-card">
          <span className="section-label">PLAN DETAILS</span>

          <h2>Vehicles and sessions</h2>

          {loadingData ? (
            <div className="scheduling-message">
              Loading vehicles and sessions...
            </div>
          ) : (
            <>
              <div className="input-summary">
                <div>
                  <span>VEHICLES</span>

                  <strong>{vehicles.length}</strong>
                </div>

                <div>
                  <span>SESSIONS</span>

                  <strong>{sessions.length}</strong>
                </div>

                <div>
                  <span>READY TO PLAN</span>

                  <strong>{jobs.length}</strong>
                </div>
              </div>

              <p className="scheduling-description">
                We’ll use charging session and vehicle details to prepare a practical schedule.
              </p>

              <button
                type="button"
                className="run-scheduling-button"
                onClick={runScheduling}
                disabled={loading || loadingData || jobs.length === 0}
              >
                {loading ? "Preparing schedule..." : "Create charging schedule"}

                {!loading && <span>↗</span>}
              </button>
            </>
          )}
        </article>

        <article className="jobs-overview-card">
          <div className="card-heading">
            <div>
              <span className="section-label">UPCOMING SESSIONS</span>

              <h2>Charging sessions</h2>
            </div>

            <span className="job-count">{jobs.length} SESSIONS</span>
          </div>

          <div className="job-list">
            {jobs.length === 0 ? (
              <div className="scheduling-message">
                No sessions are ready to schedule.
              </div>
            ) : (
              jobs.map((job) => (
                <div className="job-item" key={job.id}>
                  <div className="job-main">
                    <strong>Session {job.id}</strong>

                    <span>Vehicle {job.vehicle_id}</span>
                  </div>

                  <div className="job-meta">
                    <span>{job.priority}</span>

                    <small>
                      Deadline {new Date(job.deadline).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="scheduling-result-section">
        <div className="result-heading">
          <div>
            <span className="section-label">SCHEDULE</span>

            <h2>Suggested charging schedule</h2>
          </div>

          {result && <span className="result-status">● COMPLETE</span>}
        </div>

        {!result ? (
          <div className="empty-result">
            <span>01</span>

            <div>
              <strong>Ready to prepare a schedule</strong>

              <p>
                Create a schedule to see which sessions can be planned and which may need attention.
              </p>
            </div>
          </div>
        ) : (
          <div className="algorithm-results">
            <article className="algorithm-card">
              <div className="algorithm-card-header">
                <div>
                  <span>OPTION A</span>

                  <h3>Suggested schedule</h3>
                </div>

                <span className="algorithm-tag">SESSION PLAN</span>
              </div>

              <div className="algorithm-stats">
                <div>
                  <span>SCHEDULED</span>

                  <strong>{greedyScheduled.length}</strong>
                </div>

                <div>
                  <span>NEEDS ATTENTION</span>

                  <strong>{greedyRejected.length}</strong>
                </div>

              </div>

              <div className="scheduling-list">
                <span>PLANNED SESSIONS</span>

                {greedyScheduled.length > 0 ? (
                  greedyScheduled.map((job, index) => {
                    const jobId =
                      typeof job === "object"
                        ? (job.id ?? job.jobId ?? job.sessionId)
                        : job;

                    return (
                      <div className="scheduling-row" key={`greedy-${index}`}>
                        <span>Session {jobId}</span>

                        <strong>Included</strong>
                      </div>
                    );
                  })
                ) : (
                  <p>No scheduled jobs.</p>
                )}
              </div>

              {greedyRejected.length > 0 && (
                <div className="scheduling-list">
                  <span>SESSIONS TO REVIEW</span>

                  {greedyRejected.map((job, index) => {
                    const jobId =
                      typeof job === "object"
                        ? (job.id ?? job.jobId ?? job.sessionId)
                        : job;

                    return (
                      <div
                        className="scheduling-row"
                        key={`greedy-rejected-${index}`}
                      >
                        <span>Session {jobId}</span>

                        <strong>Not scheduled</strong>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="algorithm-card">
              <div className="algorithm-card-header">
                <div>
                  <span>OPTION B</span>

                  <h3>Alternative schedule</h3>
                </div>

                <span className="algorithm-tag">SESSION PLAN</span>
              </div>

              <div className="algorithm-stats">
                <div>
                  <span>SCHEDULED</span>

                  <strong>{dpScheduled.length}</strong>
                </div>

                <div>
                  <span>NEEDS ATTENTION</span>

                  <strong>{dpRejected.length}</strong>
                </div>

              </div>

              <div className="scheduling-list">
                <span>PLANNED SESSIONS</span>

                {dpScheduled.length > 0 ? (
                  dpScheduled.map((job, index) => {
                    const jobId =
                      typeof job === "object"
                        ? (job.id ?? job.jobId ?? job.sessionId)
                        : job;

                    return (
                      <div className="scheduling-row" key={`dp-${index}`}>
                        <span>Session {jobId}</span>

                        <strong>Included</strong>
                      </div>
                    );
                  })
                ) : (
                  <p>No scheduled jobs.</p>
                )}
              </div>

              {dpRejected.length > 0 && (
                <div className="scheduling-list">
                  <span>SESSIONS TO REVIEW</span>

                  {dpRejected.map((job, index) => {
                    const jobId =
                      typeof job === "object"
                        ? (job.id ?? job.jobId ?? job.sessionId)
                        : job;

                    return (
                      <div
                        className="scheduling-row"
                        key={`dp-rejected-${index}`}
                      >
                        <span>Session {jobId}</span>

                        <strong>Not scheduled</strong>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </div>
        )}
      </section>
    </main>
  );
}

export default Scheduling;
