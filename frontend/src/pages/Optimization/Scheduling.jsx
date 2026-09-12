
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
        throw new Error(data?.message || "Scheduling optimization failed.");
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
            SMART EV / OPTIMIZATION ENGINE
          </span>

          <h1>
            Charge <span>scheduling.</span>
          </h1>

          <p>
            Compare Greedy Interval Scheduling and Dynamic Programming for
            intelligent charging-session scheduling.
          </p>
        </div>

        <div className="scheduling-badge">
          <span>COMPARISON</span>

          <strong>GREEDY vs DYNAMIC PROGRAMMING</strong>
        </div>
      </header>

      {error && <div className="scheduling-error">{error}</div>}

      <section className="scheduling-layout">
        <article className="scheduling-control-card">
          <span className="section-label">01 — OPTIMIZATION INPUT</span>

          <h2>Scheduling dataset</h2>

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
                  <span>VALID JOBS</span>

                  <strong>{jobs.length}</strong>
                </div>
              </div>

              <p className="scheduling-description">
                Charging sessions are combined with vehicle priority and
                deadline data to create the scheduling jobs required by both
                algorithms.
              </p>

              <button
                type="button"
                className="run-scheduling-button"
                onClick={runScheduling}
                disabled={loading || loadingData || jobs.length === 0}
              >
                {loading ? "OPTIMIZING..." : "RUN BOTH ALGORITHMS"}

                {!loading && <span>↗</span>}
              </button>
            </>
          )}
        </article>

        <article className="jobs-overview-card">
          <div className="card-heading">
            <div>
              <span className="section-label">02 — SCHEDULING JOBS</span>

              <h2>Charging sessions</h2>
            </div>

            <span className="job-count">{jobs.length} JOBS</span>
          </div>

          <div className="job-list">
            {jobs.length === 0 ? (
              <div className="scheduling-message">
                No valid scheduling jobs available.
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
            <span className="section-label">03 — ALGORITHM COMPARISON</span>

            <h2>Scheduling results</h2>
          </div>

          {result && <span className="result-status">● COMPLETE</span>}
        </div>

        {!result ? (
          <div className="empty-result">
            <span>01</span>

            <div>
              <strong>Ready for optimization</strong>

              <p>
                Run the scheduling dataset through both algorithms to compare
                their performance.
              </p>
            </div>
          </div>
        ) : (
          <div className="algorithm-results">
            {/* GREEDY */}
            <article className="algorithm-card">
              <div className="algorithm-card-header">
                <div>
                  <span>ALGORITHM 01</span>

                  <h3>Greedy</h3>
                </div>

                <span className="algorithm-tag">INTERVAL SCHEDULING</span>
              </div>

              <div className="algorithm-stats">
                <div>
                  <span>SCHEDULED</span>

                  <strong>{greedyScheduled.length}</strong>
                </div>

                <div>
                  <span>REJECTED</span>

                  <strong>{greedyRejected.length}</strong>
                </div>

                <div>
                  <span>OPERATIONS</span>

                  <strong>{greedy?.operations ?? 0}</strong>
                </div>
              </div>

              <div className="scheduling-list">
                <span>SCHEDULED JOBS</span>

                {greedyScheduled.length > 0 ? (
                  greedyScheduled.map((job, index) => {
                    const jobId =
                      typeof job === "object"
                        ? (job.id ?? job.jobId ?? job.sessionId)
                        : job;

                    return (
                      <div className="scheduling-row" key={`greedy-${index}`}>
                        <span>Job {jobId}</span>

                        <strong>Scheduled</strong>
                      </div>
                    );
                  })
                ) : (
                  <p>No scheduled jobs.</p>
                )}
              </div>

              {greedyRejected.length > 0 && (
                <div className="scheduling-list">
                  <span>REJECTED JOBS</span>

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
                        <span>Job {jobId}</span>

                        <strong>Rejected</strong>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            {/* DYNAMIC PROGRAMMING */}
            <article className="algorithm-card">
              <div className="algorithm-card-header">
                <div>
                  <span>ALGORITHM 02</span>

                  <h3>Dynamic Programming</h3>
                </div>

                <span className="algorithm-tag">OPTIMAL SELECTION</span>
              </div>

              <div className="algorithm-stats">
                <div>
                  <span>SCHEDULED</span>

                  <strong>{dpScheduled.length}</strong>
                </div>

                <div>
                  <span>REJECTED</span>

                  <strong>{dpRejected.length}</strong>
                </div>

                <div>
                  <span>OPERATIONS</span>

                  <strong>{dynamicProgramming?.operations ?? 0}</strong>
                </div>
              </div>

              <div className="scheduling-list">
                <span>SCHEDULED JOBS</span>

                {dpScheduled.length > 0 ? (
                  dpScheduled.map((job, index) => {
                    const jobId =
                      typeof job === "object"
                        ? (job.id ?? job.jobId ?? job.sessionId)
                        : job;

                    return (
                      <div className="scheduling-row" key={`dp-${index}`}>
                        <span>Job {jobId}</span>

                        <strong>Scheduled</strong>
                      </div>
                    );
                  })
                ) : (
                  <p>No scheduled jobs.</p>
                )}
              </div>

              {dpRejected.length > 0 && (
                <div className="scheduling-list">
                  <span>REJECTED JOBS</span>

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
                        <span>Job {jobId}</span>

                        <strong>Rejected</strong>
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
