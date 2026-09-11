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
      setError("Source and destination must be different.");
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
      setError(err.message || "Unable to run routing algorithms.");
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

  const getOperations = (algorithm) => {
    return result?.[algorithm]?.operations ?? "—";
  };

  return (
    <div className="routing-page">
      <div className="routing-shell">

        <header className="routing-header">
          <div>
            <span className="routing-eyebrow">
              ALGORITHM 04
            </span>

            <h1>Fleet Route Optimization</h1>

            <p>
              Compare BFS and Dijkstra for efficient EV fleet
              routing across the physical network.
            </p>
          </div>

          <div className="routing-badge">
            <span></span>
            ROUTING ENGINE
          </div>
        </header>

        <section className="routing-controls">
          <div className="control-heading">
            <div>
              <span>NETWORK CONFIGURATION</span>
              <small>
                Weighted depot and charging network
              </small>
            </div>
          </div>

          <div className="controls-grid">

            <label>
              <span>Source Node</span>

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
              <span>Destination Node</span>

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
              {loading ? "OPTIMIZING..." : "RUN ROUTING"}
            </button>

          </div>

          {source === destination && (
            <p className="control-warning">
              Source and destination must be different.
            </p>
          )}
        </section>

        <section className="network-card">

          <div className="section-title">
            <div>
              <span>NETWORK GRAPH</span>
              <h2>Fleet Transportation Network</h2>
            </div>

            <div className="node-count">
              {nodes.length} NODES
            </div>
          </div>

          <div className="graph-grid">
            {nodes.map((node) => (
              <div className="graph-node" key={node}>

                <div className="node-header">
                  <strong>{node}</strong>
                  <span>
                    {graph[node].length} connections
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
            <strong>Routing Error</strong>
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

                <h2>BFS</h2>

                <p>Breadth-First Search</p>
              </div>

              <div className="algorithm-tag">
                UNWEIGHTED
              </div>
            </div>

            <div className="result-block">
              <span>OPTIMAL PATH</span>

              <strong>
                {result ? getPath("bfs") : "Run algorithm"}
              </strong>
            </div>

            <div className="algorithm-stats">

              <div>
                <span>DISTANCE</span>
                <strong>
                  {result ? `${getDistance("bfs")} km` : "—"}
                </strong>
              </div>

              <div>
                <span>OPERATIONS</span>
                <strong>
                  {getOperations("bfs")}
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

                <h2>Dijkstra</h2>

                <p>Weighted Shortest Path</p>
              </div>

              <div className="algorithm-tag">
                WEIGHTED
              </div>
            </div>

            <div className="result-block">
              <span>OPTIMAL PATH</span>

              <strong>
                {result
                  ? getPath("dijkstra")
                  : "Run algorithm"}
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

              <div>
                <span>OPERATIONS</span>
                <strong>
                  {getOperations("dijkstra")}
                </strong>
              </div>

            </div>

          </article>

        </section>

        {result && (
          <section className="comparison-card">

            <div>
              <span>ROUTE COMPARISON</span>
              <h2>Algorithm Performance</h2>
            </div>

            <div className="comparison-row">

              <div>
                <span>BFS PATH</span>
                <strong>
                  {getPath("bfs")}
                </strong>
              </div>

              <div>
                <span>DIJKSTRA PATH</span>
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