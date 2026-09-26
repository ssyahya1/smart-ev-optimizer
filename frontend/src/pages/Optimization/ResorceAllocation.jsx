import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./ResourceAllocation.css";

const defaultGraph = {
  Source: [
    { node: "Depot A", capacity: 16 },
    { node: "Depot B", capacity: 13 },
  ],
  "Depot A": [
    { node: "Depot B", capacity: 10 },
    { node: "Station A", capacity: 12 },
  ],
  "Depot B": [
    { node: "Depot A", capacity: 4 },
    { node: "Station B", capacity: 14 },
  ],
  "Station A": [
    { node: "Depot B", capacity: 9 },
    { node: "Sink", capacity: 20 },
  ],
  "Station B": [
    { node: "Station A", capacity: 7 },
    { node: "Sink", capacity: 4 },
  ],
  Sink: [],
};

function ResourceAllocation() {
  const [graph] = useState(defaultGraph);
  const [source, setSource] = useState("Source");
  const [sink, setSink] = useState("Sink");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nodes = Object.keys(graph);

  const runAllocation = async () => {
    if (source === sink) {
      setError("Choose two different locations.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await apiRequest(
        "/api/resource-allocation",
        {
          method: "POST",
          body: JSON.stringify({
            graph,
            source,
            sink,
          }),
        }
      );

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to run resource allocation."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAllocation();
  }, []);

  const getFlow = (algorithm) => {
    const data = result?.[algorithm];

    return (
      data?.maxFlow ??
      data?.flow ??
      data?.totalFlow ??
      data?.maximumFlow ??
      "—"
    );
  };

  const getAssignments = (algorithm) => {
    const data = result?.[algorithm];

    return (
      data?.assignments ??
      data?.flows ??
      data?.allocations ??
      []
    );
  };

  return (
    <div className="resource-page">
      <div className="resource-shell">

        <header className="resource-header">
          <div>
            <span className="resource-eyebrow">
              GRID CAPACITY
            </span>

            <h1>Share available capacity</h1>

            <p>
              See how much charging power can be delivered between selected locations.
            </p>
          </div>

          <div className="resource-badge">
            <span></span>
            CAPACITY PLANNER
          </div>
        </header>

        <section className="resource-controls">

          <div className="control-heading">
            <span>POWER AVAILABILITY</span>

            <small>
              Power capacity between locations
            </small>
          </div>

          <div className="controls-grid">

            <label>
              <span>Starting location</span>

              <select
                value={source}
                onChange={(e) =>
                  setSource(e.target.value)
                }
              >
                {nodes.map((node) => (
                  <option key={node} value={node}>
                    {node}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Destination</span>

              <select
                value={sink}
                onChange={(e) =>
                  setSink(e.target.value)
                }
              >
                {nodes.map((node) => (
                  <option key={node} value={node}>
                    {node}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="run-resource"
              onClick={runAllocation}
              disabled={
                loading || source === sink
              }
            >
              {loading
                ? "Preparing plan..."
                : "Check available power"}
            </button>

          </div>

          {source === sink && (
            <p className="control-warning">
              Choose two different locations.
            </p>
          )}

        </section>

        <section className="network-card">

          <div className="section-heading">
            <div>
              <span>CONNECTED SITES</span>
              <h2>Power connections</h2>
            </div>

            <div className="node-count">
              {nodes.length} LOCATIONS
            </div>
          </div>

          <div className="network-grid">

            {nodes.map((node) => (
              <div
                className="network-node"
                key={node}
              >

                <div className="node-header">
                  <strong>{node}</strong>

                  <span>
                    {graph[node].length} connections
                  </span>
                </div>

                <div className="connections">

                  {graph[node].map(
                    (edge, index) => (
                      <div
                        className="connection"
                        key={`${node}-${edge.node}-${index}`}
                      >
                        <span>
                          → {edge.node}
                        </span>

                        <b>
                          {edge.capacity} kW
                        </b>
                      </div>
                    )
                  )}

                  {graph[node].length === 0 && (
                    <div className="empty-route">
                      End location
                    </div>
                  )}

                </div>

              </div>
            ))}

          </div>

        </section>

        {error && (
          <div className="resource-error">
            <strong>Capacity unavailable</strong>
            <span>{error}</span>
          </div>
        )}

        <section className="algorithm-grid">

          <article className="algorithm-card featured">

            <div className="algorithm-top">

              <div>
                <span className="algorithm-number">
                  01
                </span>

                <h2>Option A</h2>

                <p>
                  Available charging power
                </p>
              </div>

              <div className="algorithm-tag">
                POWER AVAILABLE
              </div>

            </div>

            <div className="result-block">

              <span>AVAILABLE POWER</span>

              <strong>
                {result
                  ? `${getFlow("fordFulkerson")} kW`
                  : "Check availability"}
              </strong>

            </div>

            <div className="algorithm-stats">

              <div>
                <span>POWER CONNECTIONS</span>

                <strong>
                  {getAssignments(
                    "fordFulkerson"
                  ).length}
                </strong>
              </div>

            </div>

          </article>

          <article className="algorithm-card">

            <div className="algorithm-top">

              <div>
                <span className="algorithm-number">
                  02
                </span>

                <h2>Option B</h2>

                <p>
                  Alternative capacity plan
                </p>
              </div>

              <div className="algorithm-tag">
                POWER PLAN
              </div>

            </div>

            <div className="result-block">

              <span>ALLOCATED FLOW</span>

              <strong>
                {result
                  ? `${getFlow(
                      "greedyBottleneck"
                    )} kW`
                  : "Check availability"}
              </strong>

            </div>

            <div className="algorithm-stats">

              <div>
                <span>POWER CONNECTIONS</span>

                <strong>
                  {getAssignments(
                    "greedyBottleneck"
                  ).length}
                </strong>
              </div>

            </div>

          </article>

        </section>

        {result && (
          <section className="comparison-card">

            <div>
              <span>CAPACITY OPTIONS</span>

              <h2>Compare available power</h2>
            </div>

            <div className="comparison-row">

              <div>
                <span>OPTION A</span>

                <strong>
                  {getFlow("fordFulkerson")} kW
                </strong>
              </div>

              <div>
                <span>OPTION B</span>

                <strong>
                  {getFlow(
                    "greedyBottleneck"
                  )} kW
                </strong>
              </div>

              <div>
                <span>NETWORK</span>

                <strong>
                  {source} → {sink}
                </strong>
              </div>

            </div>

          </section>
        )}

      </div>
    </div>
  );
}

export default ResourceAllocation;