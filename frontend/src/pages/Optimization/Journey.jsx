import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Journey.css";

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

const defaultHeuristic = {
  A: 10,
  B: 8,
  C: 9,
  D: 2,
  E: 0,
};

function Journey() {
  const [graph] = useState(defaultGraph);
  const [heuristic] = useState(defaultHeuristic);

  const [source, setSource] = useState("A");
  const [destination, setDestination] = useState("E");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nodes = Object.keys(graph);

  const runJourney = async () => {
    if (source === destination) {
      setError("Source and destination must be different.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await apiRequest("/api/journey", {
        method: "POST",
        body: JSON.stringify({
          graph,
          source,
          destination,
          heuristic,
        }),
      });

      setResult(data);
    } catch (err) {
      setError(
        err.message || "Unable to run journey optimization."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runJourney();
  }, []);

  const getPath = (algorithm) => {
    const data = result?.[algorithm];

    const path =
      data?.path ??
      data?.route ??
      data?.optimalPath;

    if (Array.isArray(path)) {
      return path.join(" → ");
    }

    if (typeof path === "string") {
      return path;
    }

    return "No path returned";
  };

  const getCost = (algorithm) => {
    const data = result?.[algorithm];

    const value =
      data?.distance ??
      data?.totalDistance ??
      data?.cost ??
      data?.totalCost;

    return value !== undefined ? value : "—";
  };

  const getOperations = (algorithm) => {
    return result?.[algorithm]?.operations ?? "—";
  };

  return (
    <div className="journey-page">
      <div className="journey-shell">

        <header className="journey-header">
          <div>
            <span className="journey-eyebrow">
              ALGORITHM 05
            </span>

            <h1>Multi-Stage Journey</h1>

            <p>
              Compare A* and Bellman-Ford for intelligent
              multi-stage EV journey optimization.
            </p>
          </div>

          <div className="journey-badge">
            <span></span>
            JOURNEY ENGINE
          </div>
        </header>

        <section className="journey-controls">

          <div className="control-heading">
            <span>JOURNEY CONFIGURATION</span>

            <small>
              Weighted network with heuristic guidance
            </small>
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
              className="run-journey"
              onClick={runJourney}
              disabled={
                loading || source === destination
              }
            >
              {loading
                ? "OPTIMIZING..."
                : "OPTIMIZE JOURNEY"}
            </button>

          </div>

          {source === destination && (
            <p className="control-warning">
              Source and destination must be different.
            </p>
          )}

        </section>

        <section className="journey-network">

          <div className="section-heading">
            <div>
              <span>JOURNEY NETWORK</span>
              <h2>Multi-Stage Route Graph</h2>
            </div>

            <div className="node-count">
              {nodes.length} NODES
            </div>
          </div>

          <div className="journey-grid">

            {nodes.map((node) => (
              <div
                className="journey-node"
                key={node}
              >
                <div className="node-header">
                  <strong>{node}</strong>

                  <span>
                    h = {heuristic[node]}
                  </span>
                </div>

                <div className="connections">

                  {graph[node].map((edge, index) => (
                    <div
                      className="connection"
                      key={`${node}-${edge.node}-${index}`}
                    >
                      <span>
                        → {edge.node}
                      </span>

                      <b>
                        {edge.weight} km
                      </b>
                    </div>
                  ))}

                </div>
              </div>
            ))}

          </div>

        </section>

        <section className="heuristic-card">

          <div>
            <span>HEURISTIC VALUES</span>
            <h2>A* Guidance</h2>
          </div>

          <div className="heuristic-list">

            {nodes.map((node) => (
              <div key={node}>
                <strong>{node}</strong>
                <span>{heuristic[node]} km</span>
              </div>
            ))}

          </div>

        </section>

        {error && (
          <div className="journey-error">
            <strong>Journey Error</strong>
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

                <h2>A*</h2>

                <p>
                  Heuristic Search
                </p>
              </div>

              <div className="algorithm-tag">
                HEURISTIC
              </div>

            </div>

            <div className="result-block">

              <span>OPTIMAL PATH</span>

              <strong>
                {result
                  ? getPath("aStar")
                  : "Run algorithm"}
              </strong>

            </div>

            <div className="algorithm-stats">

              <div>
                <span>TOTAL COST</span>

                <strong>
                  {result
                    ? `${getCost("aStar")} km`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>OPERATIONS</span>

                <strong>
                  {getOperations("aStar")}
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

                <h2>Bellman-Ford</h2>

                <p>
                  Dynamic Relaxation
                </p>
              </div>

              <div className="algorithm-tag">
                WEIGHTED
              </div>

            </div>

            <div className="result-block">

              <span>OPTIMAL PATH</span>

              <strong>
                {result
                  ? getPath("bellmanFord")
                  : "Run algorithm"}
              </strong>

            </div>

            <div className="algorithm-stats">

              <div>
                <span>TOTAL COST</span>

                <strong>
                  {result
                    ? `${getCost("bellmanFord")} km`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>OPERATIONS</span>

                <strong>
                  {getOperations("bellmanFord")}
                </strong>
              </div>

            </div>

          </article>

        </section>

        {result && (
          <section className="comparison-card">

            <div>
              <span>JOURNEY COMPARISON</span>

              <h2>
                Algorithm Performance
              </h2>
            </div>

            <div className="comparison-row">

              <div>
                <span>A* PATH</span>

                <strong>
                  {getPath("aStar")}
                </strong>
              </div>

              <div>
                <span>BELLMAN-FORD PATH</span>

                <strong>
                  {getPath("bellmanFord")}
                </strong>
              </div>

              <div>
                <span>JOURNEY</span>

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

export default Journey;