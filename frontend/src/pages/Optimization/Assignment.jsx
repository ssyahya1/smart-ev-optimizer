
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";
import "./Assignment.css";

function Assignment() {
  const [vehicles, setVehicles] = useState([]);
  const [bays, setBays] = useState([]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const getBayId = (bay) =>
    bay.id ?? bay.bay_id ?? bay.bayId;

  const availableBays = bays.filter(
    (bay) => String(bay.status || "").toLowerCase() === "available"
  );

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

  const getVehicleLabel = (vehicleId) => {
    const vehicle = vehicles.find(
      (item) => String(item.id ?? item.vehicle_id) === String(vehicleId)
    );
    return vehicle?.vehicle_number ?? `Vehicle ${vehicleId}`;
  };

  const getBayLabel = (bayId) => {
    const bay = bays.find((item) => String(getBayId(item)) === String(bayId));
    return bay ? getBayNumber(bay) : `Bay ${bayId}`;
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([
        apiRequest("/api/vehicles"),
        apiRequest("/api/charging-bays"),
      ])
      .then(([vehicleData, bayData]) => {
        if (!isMounted) return;

        const loadedVehicles = Array.isArray(vehicleData)
          ? vehicleData
          : vehicleData.vehicles ?? vehicleData.data ?? [];
        const loadedBays = Array.isArray(bayData)
          ? bayData
          : bayData.chargingBays ?? bayData.bays ?? bayData.data ?? [];

        setVehicles(Array.isArray(loadedVehicles) ? loadedVehicles : []);
        setBays(Array.isArray(loadedBays) ? loadedBays : []);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Unable to load vehicles and charging bays.");
        }
      })
      .finally(() => {
        if (isMounted) setLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const runAssignment = async (event) => {
    event?.preventDefault();

    if (loading) {
      return;
    }

    if (vehicles.length === 0) {
      setError("No vehicles are ready for a charging plan.");
      return;
    }

    if (availableBays.length === 0) {
      setError("No charging bays are currently available.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/assignment", {
        method: "POST",
      });

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to create a bay recommendation."
        );
      }

      setResult({
        success: true,
        recommendedPlan: {
          assignments: data.recommendedPlan?.assignments ?? [],
          unassignedVehicles: data.recommendedPlan?.unassignedVehicles ?? [],
        },
        alternativePlan: {
          assignments: data.alternativePlan?.assignments ?? [],
          unassignedVehicles: data.alternativePlan?.unassignedVehicles ?? [],
        },
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to create a bay recommendation."
      );
    } finally {
      setLoading(false);
    }
  };

  const recommendedPlan = result?.recommendedPlan;
  const recommendedAssignments =
    recommendedPlan?.assignments ?? [];

  const recommendedUnassigned =
    recommendedPlan?.unassignedVehicles ?? [];

  return (
    <main className="assignment-page">
      <header className="assignment-header">
        <div>
          <span className="assignment-label">
            CHARGING / BAY RECOMMENDATIONS
          </span>

          <h1>
            Charging <span>plan.</span>
          </h1>

          <p>
            Find the best available bay for each vehicle that needs charging.
          </p>
        </div>

        <div className="algorithm-badge">
          <span>CHARGING PLAN</span>
          <strong>READY WHEN YOU ARE</strong>
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
            PLAN DETAILS
          </span>

          <h2>Fleet and bay availability</h2>

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
                  <span>AVAILABLE BAYS</span>
                  <strong>
                    {availableBays.length}
                  </strong>
                </div>
              </div>

              <p className="assignment-description">
                We’ll recommend available bays for vehicles that need charging.
              </p>

              {vehicles.length === 0 ? (
                <div className="plan-prerequisite">
                  <p>Add a vehicle before creating a charging plan.</p>
                  <Link className="run-assignment-button" to="/vehicles">
                    Add your first vehicle <span>↗</span>
                  </Link>
                </div>
              ) : availableBays.length === 0 ? (
                <div className="plan-prerequisite">
                  <p>All charging bays are in use or unavailable.</p>
                  <Link className="run-assignment-button" to="/bays">
                    Review charging bays <span>↗</span>
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  className="run-assignment-button"
                  onClick={runAssignment}
                  disabled={loading}
                >
                  {loading ? "Preparing plan..." : "Recommend charging bays"}
                  {!loading && <span>↗</span>}
                </button>
              )}
            </>
          )}
        </article>

        <article className="bay-overview-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                BAY AVAILABILITY
              </span>

              <h2>Charging bays</h2>
            </div>

            <span className="bay-count">
              {availableBays.length} AVAILABLE
            </span>
          </div>

          <div className="bay-list">
            {availableBays.length === 0 ? (
              <div className="assignment-message">
                No charging bays are currently available.
              </div>
            ) : (
              availableBays.map((bay) => {
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
              RECOMMENDATION
            </span>

            <h2>Suggested charging plan</h2>
          </div>

          {result && (
            <span className="result-status">
              PLAN READY
            </span>
          )}
        </div>

        {!result ? (
          <div className="empty-result">
            <span>01</span>

            <div>
              <strong>
                Your recommendation will appear here
              </strong>

              <p>
                Create a charging plan to see the best available bay for each vehicle.
              </p>
            </div>
          </div>
        ) : (
          <div className="algorithm-results">
            <article className="algorithm-card">
              <div className="algorithm-card-header">
                <div>
                  <span>CHARGING RECOMMENDATION</span>

                  <h3>Recommended bay matches</h3>
                </div>

                <span className="algorithm-tag">
                  {recommendedAssignments.length} VEHICLES
                </span>
              </div>

              <div className="algorithm-stats">
                <div>
                  <span>ASSIGNED</span>

                  <strong>
                    {recommendedAssignments.length}
                  </strong>
                </div>

                <div>
                  <span>UNASSIGNED</span>

                  <strong>
                    {recommendedUnassigned.length}
                  </strong>
                </div>

              </div>

              <div className="assignment-list">
                <span>ASSIGNMENTS</span>

                {recommendedAssignments.length > 0 ? (
                  recommendedAssignments.map(
                    (assignment, index) => (
                      <div
                        className="assignment-row"
                        key={`recommended-${index}`}
                      >
                        <span>
                          {getVehicleLabel(assignment.vehicleId)}
                        </span>

                        <strong>
                          {getBayLabel(assignment.bayId)}
                        </strong>
                      </div>
                    )
                  )
                ) : (
                  <p>No vehicles could be matched to an available bay.</p>
                )}
              </div>

              {recommendedUnassigned.length > 0 && (
                <div className="assignment-list">
                  <span>
                    UNASSIGNED VEHICLES
                  </span>

                  {recommendedUnassigned.map(
                    (vehicleId) => (
                      <div
                        className="assignment-row"
                        key={`recommended-unassigned-${vehicleId}`}
                      >
                        <span>
                          {getVehicleLabel(vehicleId)}
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
