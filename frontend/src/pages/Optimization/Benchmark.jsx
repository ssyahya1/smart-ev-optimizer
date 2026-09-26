import { useState } from "react";
import { apiRequest } from "../../services/api";
import "./Benchmark.css";

const datasetOptions = [20, 100, 500, 1000];

const planningAreas = [
  {
    key: "assignment",
    title: "Bay matching",
    algorithms: [
      ["greedy", "Greedy"],
      ["priorityQueue", "Priority Queue"],
    ],
  },
  {
    key: "scheduling",
    title: "Session planning",
    algorithms: [
      ["greedy", "Greedy"],
      ["dynamicProgramming", "Dynamic Programming"],
    ],
  },
  {
    key: "power",
    title: "Power sharing",
    algorithms: [
      ["maxHeap", "Max-Heap"],
      ["roundRobin", "Round-Robin"],
    ],
  },
  {
    key: "routing",
    title: "Fleet routes",
    algorithms: [
      ["bfs", "BFS"],
      ["dijkstra", "Dijkstra"],
    ],
  },
  {
    key: "journey",
    title: "Multi-stop journeys",
    algorithms: [
      ["aStar", "A*"],
      ["bellmanFord", "Bellman-Ford"],
    ],
  },
  {
    key: "resourceAllocation",
    title: "Grid capacity",
    algorithms: [
      ["fordFulkerson", "Ford-Fulkerson"],
      ["greedyBottleneck", "Greedy Bottleneck"],
    ],
  },
];

function formatTime(value) {
  if (value === undefined || value === null) {
    return "—";
  }

  return `${Number(value).toFixed(4)} ms`;
}

function Benchmarks() {
  const [datasetSize, setDatasetSize] = useState(20);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runBenchmark = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await apiRequest("/api/benchmark", {
        method: "POST",
        body: JSON.stringify({
          datasetSize: Number(datasetSize),
        }),
      });

      setResult(data);
    } catch (err) {
      setError(
        err.message || "Unable to compare plans."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="benchmarks-page">
      <div className="benchmarks-shell">

        <header className="benchmarks-header">
          <div>
            <span className="benchmarks-eyebrow">
              PLAN COMPARISON
            </span>

            <h1>Plan generation report</h1>

            <p>
              Compare planning time across different fleet sizes.
            </p>
          </div>

          <div className="benchmark-status">
            <span></span>
            READY TO COMPARE
          </div>
        </header>

        <section className="benchmark-control">

          <div>
            <span className="control-label">
              FLEET SIZE
            </span>

            <p>
              Choose the number of vehicles to include.
            </p>
          </div>

          <div className="dataset-options">
            {datasetOptions.map((size) => (
              <button
                key={size}
                className={
                  datasetSize === size
                    ? "dataset-button active"
                    : "dataset-button"
                }
                onClick={() => setDatasetSize(size)}
              >
                <strong>{size.toLocaleString()}</strong>
                <span>VEHICLES</span>
              </button>
            ))}
          </div>

          <button
            className="benchmark-run"
            onClick={runBenchmark}
            disabled={loading}
          >
            {loading
              ? "Comparing plans..."
              : "Compare plans"}
          </button>

        </section>

        {error && (
          <div className="benchmark-error">
            <strong>Couldn’t compare plans</strong>
            <span>{error}</span>
          </div>
        )}

        {!result && !loading && !error && (
          <section className="benchmark-empty">
            <div className="empty-number">06</div>

            <h2>Compare plan generation</h2>

            <p>
              Choose a fleet size to see generation time across six planning areas.
            </p>
          </section>
        )}

        {loading && (
          <section className="benchmark-loading">
            <div className="loading-line"></div>

            <span>
              Preparing plan comparison...
            </span>
          </section>
        )}

        {result && (
          <>
            <section className="benchmark-summary">

              <div>
                <span>FLEET SIZE</span>
                <strong>
                  {Number(
                    result.datasetSize
                  ).toLocaleString()}
                </strong>
                <small>vehicles</small>
              </div>

              <div>
                <span>PLANNING AREAS</span>
                <strong>06</strong>
                <small>included</small>
              </div>

              <div>
                <span>TIME UNIT</span>
                <strong>ms</strong>
                <small>execution time</small>
              </div>

            </section>

            <section className="benchmark-results">

              <div className="results-heading">
                <div>
                  <span>RESULTS</span>
                  <h2>Plan generation details</h2>
                </div>

                <span>
                  {Number(
                    result.datasetSize
                  ).toLocaleString()}{" "}
                  VEHICLES
                </span>
              </div>

              <div className="results-table">

                <div className="table-head">
                  <span>PLANNING AREA</span>
                  <span>OPTION</span>
                  <span>GENERATION TIME</span>
                </div>

                {planningAreas.map((group) =>
                  group.algorithms.map(
                    ([algorithmKey], index) => {
                      const data =
                        result[group.key]?.[
                          algorithmKey
                        ];

                      return (
                        <div
                          className="table-row"
                          key={`${group.key}-${algorithmKey}`}
                        >
                          <div>
                            {index === 0 && (
                              <strong>
                                {group.title}
                              </strong>
                            )}
                          </div>

                          <div className="algorithm-name">
                            <span>
                              {index === 0
                                ? "Option A"
                                : "Option B"}
                            </span>
                          </div>

                          <div className="execution-value">
                            {formatTime(
                              data?.executionTimeMs
                            )}
                          </div>

                        </div>
                      );
                    }
                  )
                )}

              </div>

            </section>

            <section className="comparison-grid">

              {planningAreas.map((group) => {
                const first =
                  result[group.key]?.[
                    group.algorithms[0][0]
                  ];

                const second =
                  result[group.key]?.[
                    group.algorithms[1][0]
                  ];

                return (
                  <article
                    className="comparison-card"
                    key={group.key}
                  >
                    <div className="comparison-card-header">
                      <span>
                        {group.title}
                      </span>

                      <small>
                        Option A
                        {" / "}
                        Option B
                      </small>
                    </div>

                    <div className="comparison-values">

                      <div>
                        <small>
                          Option A
                        </small>

                        <strong>
                          {formatTime(
                            first?.executionTimeMs
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>
                          Option B
                        </small>

                        <strong>
                          {formatTime(
                            second?.executionTimeMs
                          )}
                        </strong>
                      </div>

                    </div>

                  </article>
                );
              })}

            </section>

            <section className="benchmark-footer">

              <div>
                <span>REPORT NOTE</span>

                <p>
                  Generation time can vary slightly between runs depending on current system activity.
                </p>
              </div>

              <div className="dataset-label">
                {Number(
                  result.datasetSize
                ).toLocaleString()}
              </div>

            </section>
          </>
        )}

      </div>
    </div>
  );
}

export default Benchmarks;