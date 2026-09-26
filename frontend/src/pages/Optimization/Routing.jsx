import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Routing.css";

const defaultGraph = {
  A: [
    { node: "B", weight: 4 },
    { node: "C", weight: 2 },
  ],
  B: [
    { node: "A", weight: 4 },
    { node: "C", weight: 1 },
    { node: "D", weight: 5 },
  ],
  C: [
    { node: "A", weight: 2 },
    { node: "B", weight: 1 },
    { node: "D", weight: 8 },
    { node: "E", weight: 10 },
  ],
  D: [
    { node: "B", weight: 5 },
    { node: "C", weight: 8 },
    { node: "E", weight: 2 },
  ],
  E: [
    { node: "C", weight: 10 },
    { node: "D", weight: 2 },
  ],
};

function Routing() {
  const [graph] = useState(defaultGraph);
  const [source, setSource] = useState("A");
  const [destination, setDestination] = useState("E");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nodes = Object.keys(graph);

  const runRouting = async () => {
    if (source === destination) {
      setError("Choose two different locations.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await apiRequest("/api/routing", {
        method: "POST",
        body: JSON.stringify({
          graph,
          source,
          destination,
        }),
      });

      setResult(data);
    } catch (err) {
      setError(err.message || "No route could be found. Please try another destination.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runRouting();
  }, []);

  const getPath = (algorithm) => {
    const path = result?.[algorithm]?.path;

    if (Array.isArray(path)) {
      return path.join(" → ");
    }

    return "No path returned";
  };

  const getDistance = (algorithm) => {
    const value =
      result?.[algorithm]?.distance ??
      result?.[algorithm]?.totalDistance ??
      result?.[algorithm]?.cost;

    return value !== undefined ? value : "—";
  };

  return (
    <div className="routing-page">
      <div className="routing-shell">

        <header className="routing-header">
          <div>
            <span className="routing-eyebrow">
              FLEET ROUTES
            </span>

            <h1>Find a fleet route</h1>

            <p>
              Choose where to start and finish to see available route options.
            </p>
          </div>

          <div className="routing-badge">
            <span></span>
            ROUTE PLANNER
          </div>
        </header>

        <section className="routing-controls">
          <div className="control-heading">
            <div>
              <span>ROUTE DETAILS</span>
              <small>
                Charging sites and connected locations
              </small>
            </div>
          </div>

          <div className="controls-grid">

            <label>
              <span>Starting location</span>

              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
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
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value)
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
              className="run-routing"
              onClick={runRouting}
              disabled={loading || source === destination}
            >
              {loading ? "Finding route..." : "Find route"}
            </button>

          </div>

          {source === destination && (
            <p className="control-warning">
              Choose two different locations.
            </p>
          )}
        </section>

        <section className="network-card">

          <div className="section-title">
            <div>
              <span>SITE CONNECTIONS</span>
              <h2>Connected locations</h2>
            </div>

            <div className="node-count">
              {nodes.length} LOCATIONS
            </div>
          </div>

          <div className="graph-grid">
            {nodes.map((node) => (
              <div className="graph-node" key={node}>

                <div className="node-header">
                  <strong>{node}</strong>
                  <span>
                    {graph[node].length} routes
                  </span>
                </div>

                <div className="connections">
                  {graph[node].map((edge, index) => (
                    <div
                      className="connection"
                      key={`${node}-${edge.node}-${index}`}
                    >
                      <span>→ {edge.node}</span>
                      <b>{edge.weight} km</b>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </section>

        {error && (
          <div className="routing-error">
            <strong>Route unavailable</strong>
            <span>{error}</span>
          </div>
        )}

        <section className="algorithm-grid">

          <article className="algorithm-card">

            <div className="algorithm-top">
              <div>
                <span className="algorithm-number">
                  01
                </span>

                <h2>Option A</h2>

                <p>Available route</p>
              </div>

              <div className="algorithm-tag">
                DIRECT
              </div>
            </div>

            <div className="result-block">
              <span>SUGGESTED ROUTE</span>

              <strong>
                {result ? getPath("bfs") : "Find route"}
              </strong>
            </div>

            <div className="algorithm-stats">

              <div>
                <span>DISTANCE</span>
                <strong>
                  {result ? `${getDistance("bfs")} km` : "—"}
                </strong>
              </div>

            </div>

          </article>

          <article className="algorithm-card featured">

            <div className="algorithm-top">
              <div>
                <span className="algorithm-number">
                  02
                </span>

                <h2>Option B</h2>

                <p>Distance-focused route</p>
              </div>

              <div className="algorithm-tag">
                SHORTEST DISTANCE
              </div>
            </div>

            <div className="result-block">
              <span>ALTERNATIVE ROUTE</span>

              <strong>
                {result
                  ? getPath("dijkstra")
                  : "Find route"}
              </strong>
            </div>

            <div className="algorithm-stats">

              <div>
                <span>DISTANCE</span>
                <strong>
                  {result
                    ? `${getDistance("dijkstra")} km`
                    : "—"}
                </strong>
              </div>

            </div>

          </article>

        </section>

        {result && (
          <section className="comparison-card">

            <div>
              <span>ROUTE OPTIONS</span>
              <h2>Compare available routes</h2>
            </div>

            <div className="comparison-row">

              <div>
                <span>OPTION A</span>
                <strong>
                  {getPath("bfs")}
                </strong>
              </div>

              <div>
                <span>OPTION B</span>
                <strong>
                  {getPath("dijkstra")}
                </strong>
              </div>

              <div>
                <span>ROUTE</span>
                <strong>
                  {source} → {destination}
                </strong>
              </div>

            </div>

          </section>
        )}

      </div>
    </div>
  );
}

export default Routing;