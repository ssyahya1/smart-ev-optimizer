
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Power.css";

function Power() {
  const [vehicles, setVehicles] = useState([]);
  const [availablePower, setAvailablePower] = useState(100);

  const [result, setResult] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getVehicleId = (vehicle) =>
    vehicle.id ?? vehicle.vehicle_id ?? vehicle.vehicleId;

  const getRequestedPower = (vehicle) => {
    const batteryCapacity = Number(
      vehicle.battery_capacity_kwh ??
        vehicle.battery_kwh ??
        vehicle.batteryCapacity
    );

    const initialSoc = Number(
      vehicle.initial_soc ??
        vehicle.soc ??
        vehicle.state_of_charge
    );

    const arrival = new Date(vehicle.arrival_time);
    const deadline = new Date(vehicle.deadline);

    if (
      !Number.isFinite(batteryCapacity) ||
      batteryCapacity <= 0 ||
      !Number.isFinite(initialSoc) ||
      initialSoc < 0 ||
      initialSoc > 100 ||
      Number.isNaN(arrival.getTime()) ||
      Number.isNaN(deadline.getTime())
    ) {
      return null;
    }

    const requiredEnergy =
      batteryCapacity * ((100 - initialSoc) / 100);

    const availableHours =
      (deadline - arrival) / (1000 * 60 * 60);

    const chargingHours = Math.max(
      availableHours,
      0.25
    );

    const requestedPower =
      requiredEnergy / chargingHours;

    if (
      !Number.isFinite(requestedPower) ||
      requestedPower <= 0
    ) {
      return null;
    }

    return Number(requestedPower.toFixed(2));
  };

  const loadVehicles = async () => {
    try {
      setLoadingData(true);
      setError("");

      const data = await apiRequest("/api/vehicles");

      let loadedVehicles = [];

      if (Array.isArray(data)) {
        loadedVehicles = data;
      } else if (Array.isArray(data.vehicles)) {
        loadedVehicles = data.vehicles;
      } else if (Array.isArray(data.data)) {
        loadedVehicles = data.data;
      }

      setVehicles(loadedVehicles);
    } catch (err) {
      setError(
        err.message || "Unable to load vehicles."
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const buildPowerVehicles = () => {
    return vehicles
      .map((vehicle) => {
        const requestedPower =
          getRequestedPower(vehicle);

        if (requestedPower === null) {
          return null;
        }

        return {
          id: Number(getVehicleId(vehicle)),
          priority: vehicle.priority,
          requested_power_kw: requestedPower,
        };
      })
      .filter(Boolean);
  };

  const runPowerOptimization = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const powerVehicles =
        buildPowerVehicles();

      if (powerVehicles.length === 0) {
        throw new Error(
          "No valid vehicles are available for power allocation."
        );
      }

      const power = Number(availablePower);

      if (!Number.isFinite(power) || power <= 0) {
        throw new Error(
          "Available transformer power must be greater than 0."
        );
      }

      const data = await apiRequest(
        "/api/power",
        {
          method: "POST",
          body: JSON.stringify({
            vehicles: powerVehicles,
            availablePower: power,
          }),
        }
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to prepare a power plan."
        );
      }

      setResult({
        maxHeap: data.maxHeap ?? {
          allocations: [],
          remainingPowerKw: 0,
          operations: 0,
        },
        roundRobin: data.roundRobin ?? {
          allocations: [],
          remainingPowerKw: 0,
          operations: 0,
        },
      });
    } catch (err) {
      console.error(
        "Power allocation error:",
        err
      );

      setError(
        err.message ||
          "Unable to run power allocation."
      );
    } finally {
      setLoading(false);
    }
  };

  const powerVehicles = buildPowerVehicles();

  const maxHeap =
    result?.maxHeap;

  const roundRobin =
    result?.roundRobin;

  const formatKw = (value) =>
    `${Number(value ?? 0).toFixed(2)} kW`;

  return (
    <main className="power-page">
      <header className="power-header">
        <div>
          <span className="power-label">
            CHARGING / SITE POWER
          </span>

          <h1>
            Power <span>allocation.</span>
          </h1>

          <p>
            Share available site power across vehicles while respecting charging priorities.
          </p>
        </div>

        <div className="power-badge">
          <span>POWER PLAN</span>

          <strong>
            READY WHEN YOU ARE
          </strong>
        </div>
      </header>

      {error && (
        <div className="power-error">
          {error}
        </div>
      )}

      <section className="power-layout">
        <article className="power-control-card">
          <span className="section-label">
            PLAN DETAILS
          </span>

          <h2>Available site power</h2>

          {loadingData ? (
            <div className="power-message">
              Loading vehicles...
            </div>
          ) : (
            <>
              <div className="power-input">
                <label htmlFor="availablePower">
                  AVAILABLE SITE POWER
                </label>

                <div className="power-input-wrap">
                  <input
                    id="availablePower"
                    type="number"
                    min="1"
                    max="100000"
                    step="0.1"
                    value={availablePower}
                    onChange={(event) =>
                      setAvailablePower(
                        event.target.value
                      )
                    }
                  />

                  <span>kW</span>
                </div>
              </div>

              <div className="input-summary">
                <div>
                  <span>VEHICLES</span>
                  <strong>
                    {vehicles.length}
                  </strong>
                </div>

                <div>
                  <span>CHARGING REQUESTS</span>
                  <strong>
                    {powerVehicles.length}
                  </strong>
                </div>

                <div>
                  <span>CAPACITY</span>
                  <strong>
                    {Number(
                      availablePower || 0
                    ).toFixed(0)}
                    <small> kW</small>
                  </strong>
                </div>
              </div>

              <p className="power-description">
                Review how available power can be shared across current vehicle requests.
              </p>

              <button
                type="button"
                className="run-power-button"
                onClick={runPowerOptimization}
                disabled={
                  loading ||
                  loadingData ||
                  powerVehicles.length === 0
                }
              >
                {loading
                  ? "Preparing plan..."
                  : "Create power plan"}

                {!loading && (
                  <span>↗</span>
                )}
              </button>
            </>
          )}
        </article>

        <article className="vehicle-demand-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                POWER REQUESTS
              </span>

              <h2>Charging requests</h2>
            </div>

            <span className="vehicle-count">
              {powerVehicles.length} REQUESTS
            </span>
          </div>

          <div className="vehicle-demand-list">
            {powerVehicles.length === 0 ? (
              <div className="power-message">
                No valid power requests available.
              </div>
            ) : (
              powerVehicles.map((vehicle) => (
                <div
                  className="demand-item"
                  key={vehicle.id}
                >
                  <div className="demand-main">
                    <strong>
                      Vehicle {vehicle.id}
                    </strong>

                    <span>
                      {vehicle.priority}
                    </span>
                  </div>

                  <div className="demand-power">
                    <span>
                      REQUESTED
                    </span>

                    <strong>
                      {formatKw(
                        vehicle.requested_power_kw
                      )}
                    </strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="power-result-section">
        <div className="result-heading">
          <div>
            <span className="section-label">
              POWER PLAN
            </span>

            <h2>Allocation results</h2>
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
                Create a plan to see how much power can be assigned to each vehicle.
              </p>
            </div>
          </div>
        ) : (
          <div className="algorithm-results">
            <article className="algorithm-card">
              <div className="algorithm-card-header">
                <div>
                  <span>
                    OPTION A
                  </span>

                  <h3>Suggested power plan</h3>
                </div>

                <span className="algorithm-tag">
                  PRIORITY ALLOCATION
                </span>
              </div>

              <div className="algorithm-stats">
                <div>
                  <span>ALLOCATIONS</span>

                  <strong>
                    {maxHeap?.allocations
                      ?.length ?? 0}
                  </strong>
                </div>

                <div>
                  <span>REMAINING</span>

                  <strong>
                    {Number(
                      maxHeap
                        ?.remainingPowerKw ?? 0
                    ).toFixed(1)}
                    <small> kW</small>
                  </strong>
                </div>

              </div>

              <AllocationList
                allocations={
                  maxHeap?.allocations ?? []
                }
              />
            </article>

            <article className="algorithm-card">
              <div className="algorithm-card-header">
                <div>
                  <span>
                    OPTION B
                  </span>

                  <h3>Alternative power plan</h3>
                </div>

                <span className="algorithm-tag">
                  FAIR THROTTLING
                </span>
              </div>

              <div className="algorithm-stats">
                <div>
                  <span>ALLOCATIONS</span>

                  <strong>
                    {roundRobin?.allocations
                      ?.length ?? 0}
                  </strong>
                </div>

                <div>
                  <span>REMAINING</span>

                  <strong>
                    {Number(
                      roundRobin
                        ?.remainingPowerKw ?? 0
                    ).toFixed(1)}
                    <small> kW</small>
                  </strong>
                </div>

              </div>

              <AllocationList
                allocations={
                  roundRobin?.allocations ?? []
                }
              />
            </article>
          </div>
        )}
      </section>
    </main>
  );
}

function AllocationList({ allocations }) {
  return (
    <div className="allocation-list">
      <span>POWER SHARED</span>

      {allocations.length === 0 ? (
        <p>No allocations.</p>
      ) : (
        allocations.map(
          (allocation, index) => (
            <div
              className="allocation-row"
              key={`${allocation.vehicleId}-${index}`}
            >
              <div>
                <strong>
                  Vehicle {allocation.vehicleId}
                </strong>

                <span>
                  Requested{" "}
                  {Number(
                    allocation.requestedPowerKw ??
                      0
                  ).toFixed(2)}
                  {" "}kW
                </span>
              </div>

              <strong>
                {Number(
                  allocation.allocatedPowerKw ?? 0
                ).toFixed(2)}
                {" "}kW
              </strong>
            </div>
          )
        )
      )}
    </div>
  );
}

export default Power;


