
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Assignment.css";

function Assignment() {
  const [vehicles, setVehicles] = useState([]);
  const [bays, setBays] = useState([]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const getVehicleId = (vehicle) =>
    vehicle.id ?? vehicle.vehicle_id ?? vehicle.vehicleId;

  const getBayId = (bay) =>
    bay.id ?? bay.bay_id ?? bay.bayId;

  const getBayNumber = (bay) =>
    bay.bay_number ??
    bay.bay_id ??
    bay.bayId ??
    bay.id;

  const getBayPower = (bay) =>
    bay.max_power_kw ??
    bay.power_kw ??
    bay.power ??
    bay.maxPower;

  const getBayType = (bay) =>
    bay.charger_type ??
    bay.chargerType ??
    bay.type ??
    "—";

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [vehicleData, bayData] = await Promise.all([
        apiRequest("/api/vehicles"),
        apiRequest("/api/charging-bays"),
      ]);

      let loadedVehicles = [];
      let loadedBays = [];

      if (Array.isArray(vehicleData)) {
        loadedVehicles = vehicleData;
      } else if (Array.isArray(vehicleData.vehicles)) {
        loadedVehicles = vehicleData.vehicles;
      } else if (Array.isArray(vehicleData.data)) {
        loadedVehicles = vehicleData.data;
      }

      if (Array.isArray(bayData)) {
        loadedBays = bayData;
      } else if (Array.isArray(bayData.chargingBays)) {
        loadedBays = bayData.chargingBays;
      } else if (Array.isArray(bayData.bays)) {
        loadedBays = bayData.bays;
      } else if (Array.isArray(bayData.data)) {
        loadedBays = bayData.data;
      }

      setVehicles(loadedVehicles);
      setBays(loadedBays);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load vehicles and charging bays."
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAssignment = async (event) => {
    event?.preventDefault();

    if (loading) {
      return;
    }

    if (vehicles.length === 0) {
      setError("No vehicles are available for optimization.");
      return;
    }

    if (bays.length === 0) {
      setError("No charging bays are available for optimization.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const assignmentVehicles = vehicles.map((vehicle) => ({
        id: Number(getVehicleId(vehicle)),
        priority: vehicle.priority,
        arrival_time: vehicle.arrival_time,
        deadline: vehicle.deadline,
        initial_soc: Number(vehicle.initial_soc),
        battery_capacity_kwh: Number(
          vehicle.battery_capacity_kwh
        ),
      }));

      const assignmentBays = bays.map((bay) => ({
        id: Number(getBayId(bay)),
        status: bay.status,
        max_power_kw: Number(getBayPower(bay)),
      }));

      const data = await apiRequest("/api/assignment", {
        method: "POST",
        body: JSON.stringify({
          vehicles: assignmentVehicles,
          chargingBays: assignmentBays,
        }),
      });

      console.log("Assignment API result:", data);

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Assignment optimization failed."
        );
      }

      // Keep the successful result in React state.
      setResult({
        success: true,
        greedy: {
          assignments:
            data.greedy?.assignments ?? [],
          unassignedVehicles:
            data.greedy?.unassignedVehicles ?? [],
          operations:
            data.greedy?.operations ?? 0,
        },
        priorityQueue: {
          assignments:
            data.priorityQueue?.assignments ?? [],
          unassignedVehicles:
            data.priorityQueue?.unassignedVehicles ?? [],
          operations:
            data.priorityQueue?.operations ?? 0,
        },
      });
    } catch (err) {
      console.error("Assignment error:", err);
      setError(
        err.message ||
          "Unable to run bay assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  const greedy = result?.greedy;
  const priorityQueue = result?.priorityQueue;

  const greedyAssignments =
    greedy?.assignments ?? [];

  const priorityAssignments =
    priorityQueue?.assignments ?? [];

  const greedyUnassigned =
    greedy?.unassignedVehicles ?? [];

  const priorityUnassigned =
    priorityQueue?.unassignedVehicles ?? [];

  return (
    <main className="assignment-page">
      <header className="assignment-header">
        <div>
          <span className="assignment-label">
            SMART EV / OPTIMIZATION ENGINE
          </span>

          <h1>
            Bay <span>assignment.</span>
          </h1>

          <p>
            Compare Greedy and Priority Queue strategies
            for intelligent charging-bay allocation.
          </p>
        </div>

        <div className="algorithm-badge">
          <span>COMPARISON</span>
          <strong>
            GREEDY vs PRIORITY QUEUE
          </strong>
        </div>
      </header>

      {error && (
        <div className="assignment-error">
          {error}
        </div>
      )}

      <section className="assignment-layout">
        <article className="assignment-control-card">
          <span className="section-label">
            01 — OPTIMIZATION INPUT
          </span>

          <h2>Assignment dataset</h2>

          {loadingData ? (
            <div className="assignment-message">
              Loading vehicles and bays...
            </div>
          ) : (
            <>
              <div className="input-summary">
                <div>
                  <span>VEHICLES</span>
                  <strong>
                    {vehicles.length}
                  </strong>
                </div>

                <div>
                  <span>CHARGING BAYS</span>
                  <strong>
                    {bays.length}
                  </strong>
                </div>
              </div>

              <p className="assignment-description">
                The complete vehicle and charging-bay
                dataset will be processed by both
                assignment algorithms.
              </p>

              <button
                type="button"
                className="run-assignment-button"
                onClick={runAssignment}
                disabled={
                  loading ||
                  loadingData ||
                  vehicles.length === 0 ||
                  bays.length === 0
                }
              >
                {loading
                  ? "OPTIMIZING..."
                  : "RUN BOTH ALGORITHMS"}

                {!loading && <span>↗</span>}
              </button>
            </>
          )}
        </article>

        <article className="bay-overview-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                02 — AVAILABLE INFRASTRUCTURE
              </span>

              <h2>Charging bays</h2>
            </div>

            <span className="bay-count">
              {bays.length} BAYS
            </span>
          </div>

          <div className="bay-list">
            {bays.length === 0 ? (
              <div className="assignment-message">
                No charging bays available.
              </div>
            ) : (
              bays.map((bay) => {
                const id = getBayId(bay);

                return (
                  <div
                    className="bay-item"
                    key={id}
                  >
                    <div>
                      <strong>
                        {getBayNumber(bay)}
                      </strong>

                      <span>
                        {getBayType(bay)}
                      </span>
                    </div>

                    <div className="bay-power">
                      {getBayPower(bay) ?? "—"} kW
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>

      <section className="assignment-result-section">
        <div className="result-heading">
          <div>
            <span className="section-label">
              03 — ALGORITHM COMPARISON
            </span>

            <h2>Assignment results</h2>
          </div>

          {result && (
            <span className="result-status">
              ● COMPLETE
            </span>
          )}
        </div>

        {!result ? (
          <div className="empty-result">
            <span>01</span>

            <div>
              <strong>
                Ready for optimization
              </strong>

              <p>
                Run the dataset through both algorithms
                to compare their assignment performance.
              </p>
            </div>
          </div>
        ) : (
          <div className="algorithm-results">
            <article className="algorithm-card">
              <div className="algorithm-card-header">
                <div>
                  <span>ALGORITHM 01</span>

                  <h3>Greedy</h3>
                </div>

                <span className="algorithm-tag">
                  LOCAL OPTIMUM
                </span>
              </div>

              <div className="algorithm-stats">
                <div>
                  <span>ASSIGNED</span>

                  <strong>
                    {greedyAssignments.length}
                  </strong>
                </div>

                <div>
                  <span>UNASSIGNED</span>

                  <strong>
                    {greedyUnassigned.length}
                  </strong>
                </div>

                <div>
                  <span>OPERATIONS</span>

                  <strong>
                    {greedy?.operations ?? 0}
                  </strong>
                </div>
              </div>

              <div className="assignment-list">
                <span>ASSIGNMENTS</span>

                {greedyAssignments.length > 0 ? (
                  greedyAssignments.map(
                    (assignment, index) => (
                      <div
                        className="assignment-row"
                        key={`greedy-${index}`}
                      >
                        <span>
                          Vehicle{" "}
                          {assignment.vehicleId}
                        </span>

                        <strong>
                          Bay {assignment.bayId}
                        </strong>
                      </div>
                    )
                  )
                ) : (
                  <p>No assignments.</p>
                )}
              </div>

              {greedyUnassigned.length > 0 && (
                <div className="assignment-list">
                  <span>
                    UNASSIGNED VEHICLES
                  </span>

                  {greedyUnassigned.map(
                    (vehicleId) => (
                      <div
                        className="assignment-row"
                        key={`greedy-unassigned-${vehicleId}`}
                      >
                        <span>
                          Vehicle {vehicleId}
                        </span>

                        <strong>
                          Unassigned
                        </strong>
                      </div>
                    )
                  )}
                </div>
              )}
            </article>

            <article className="algorithm-card">
              <div className="algorithm-card-header">
                <div>
                  <span>ALGORITHM 02</span>

                  <h3>Priority Queue</h3>
                </div>

                <span className="algorithm-tag">
                  PRIORITY AWARE
                </span>
              </div>

              <div className="algorithm-stats">
                <div>
                  <span>ASSIGNED</span>

                  <strong>
                    {priorityAssignments.length}
                  </strong>
                </div>

                <div>
                  <span>UNASSIGNED</span>

                  <strong>
                    {priorityUnassigned.length}
                  </strong>
                </div>

                <div>
                  <span>OPERATIONS</span>

                  <strong>
                    {priorityQueue?.operations ?? 0}
                  </strong>
                </div>
              </div>

              <div className="assignment-list">
                <span>ASSIGNMENTS</span>

                {priorityAssignments.length > 0 ? (
                  priorityAssignments.map(
                    (assignment, index) => (
                      <div
                        className="assignment-row"
                        key={`priority-${index}`}
                      >
                        <span>
                          Vehicle{" "}
                          {assignment.vehicleId}
                        </span>

                        <strong>
                          Bay {assignment.bayId}
                        </strong>
                      </div>
                    )
                  )
                ) : (
                  <p>No assignments.</p>
                )}
              </div>

              {priorityUnassigned.length > 0 && (
                <div className="assignment-list">
                  <span>
                    UNASSIGNED VEHICLES
                  </span>

                  {priorityUnassigned.map(
                    (vehicleId) => (
                      <div
                        className="assignment-row"
                        key={`priority-unassigned-${vehicleId}`}
                      >
                        <span>
                          Vehicle {vehicleId}
                        </span>

                        <strong>
                          Unassigned
                        </strong>
                      </div>
                    )
                  )}
                </div>
              )}
            </article>
          </div>
        )}
      </section>
    </main>
  );
}

export default Assignment;
