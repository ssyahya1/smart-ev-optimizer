import { useState } from "react";
import { apiRequest } from "../../services/api";
import "./Benchmark.css";

const datasetOptions = [20, 100, 500, 1000];

const algorithms = [
  {
    key: "assignment",
    title: "Bay Assignment",
    algorithms: [
      ["greedy", "Greedy"],
      ["priorityQueue", "Priority Queue"],
    ],
  },
  {
    key: "scheduling",
    title: "Charge Scheduling",
    algorithms: [
      ["greedy", "Greedy"],
      ["dynamicProgramming", "Dynamic Programming"],
    ],
  },
  {
    key: "power",
    title: "Power Contention",
    algorithms: [
      ["maxHeap", "Max-Heap"],
      ["roundRobin", "Round-Robin"],
    ],
  },
  {
    key: "routing",
    title: "Fleet Routing",
    algorithms: [
      ["bfs", "BFS"],
      ["dijkstra", "Dijkstra"],
    ],
  },
  {
    key: "journey",
    title: "Multi-Stage Journey",
    algorithms: [
      ["aStar", "A*"],
      ["bellmanFord", "Bellman-Ford"],
    ],
  },
  {
    key: "resourceAllocation",
    title: "Resource Allocation",
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

function formatNumber(value) {
  if (value === undefined || value === null) {
    return "—";
  }

  return Number(value).toLocaleString();
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
        err.message || "Unable to run benchmark."
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
              PERFORMANCE LAB
            </span>

            <h1>Algorithm Benchmarks</h1>

            <p>
              Measure execution time and operation counts
              across every optimization strategy.
            </p>
          </div>

          <div className="benchmark-status">
            <span></span>
            BENCHMARK ENGINE
          </div>
        </header>

        <section className="benchmark-control">

          <div>
            <span className="control-label">
              DATASET SIZE
            </span>

            <p>
              Select the workload used by the benchmark
              engine.
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
              ? "RUNNING BENCHMARK..."
              : "RUN BENCHMARK"}
          </button>

        </section>

        {error && (
          <div className="benchmark-error">
            <strong>Benchmark Error</strong>
            <span>{error}</span>
          </div>
        )}

        {!result && !loading && !error && (
          <section className="benchmark-empty">
            <div className="empty-number">06</div>

            <h2>Performance comparison</h2>

            <p>
              Choose a dataset size and run the benchmark
              to compare all six algorithm pairs.
            </p>
          </section>
        )}

        {loading && (
          <section className="benchmark-loading">
            <div className="loading-line"></div>

            <span>
              Generating dataset and executing algorithms...
            </span>
          </section>
        )}

        {result && (
          <>
            <section className="benchmark-summary">

              <div>
                <span>DATASET</span>
                <strong>
                  {Number(
                    result.datasetSize
                  ).toLocaleString()}
                </strong>
                <small>vehicles</small>
              </div>

              <div>
                <span>ALGORITHM PAIRS</span>
                <strong>06</strong>
                <small>comparisons</small>
              </div>

              <div>
                <span>MEASUREMENT</span>
                <strong>ms</strong>
                <small>execution time</small>
              </div>

            </section>

            <section className="benchmark-results">

              <div className="results-heading">
                <div>
                  <span>RESULTS</span>
                  <h2>Performance Matrix</h2>
                </div>

                <span>
                  {Number(
                    result.datasetSize
                  ).toLocaleString()}{" "}
                  VEHICLE DATASET
                </span>
              </div>

              <div className="results-table">

                <div className="table-head">
                  <span>OPTIMIZATION</span>
                  <span>ALGORITHM</span>
                  <span>EXECUTION</span>
                  <span>OPERATIONS</span>
                </div>

                {algorithms.map((group) =>
                  group.algorithms.map(
                    ([algorithmKey, algorithmName], index) => {
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
                                ? "A"
                                : "B"}
                            </span>

                            {algorithmName}
                          </div>

                          <div className="execution-value">
                            {formatTime(
                              data?.executionTimeMs
                            )}
                          </div>

                          <div className="operations-value">
                            {formatNumber(
                              data?.operations
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

              {algorithms.map((group) => {
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
                        {group.algorithms[0][1]}
                        {" / "}
                        {group.algorithms[1][1]}
                      </small>
                    </div>

                    <div className="comparison-values">

                      <div>
                        <small>
                          {group.algorithms[0][1]}
                        </small>

                        <strong>
                          {formatTime(
                            first?.executionTimeMs
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>
                          {group.algorithms[1][1]}
                        </small>

                        <strong>
                          {formatTime(
                            second?.executionTimeMs
                          )}
                        </strong>
                      </div>

                    </div>

                    <div className="operation-comparison">

                      <span>
                        OPERATIONS
                      </span>

                      <strong>
                        {formatNumber(
                          first?.operations
                        )}
                      </strong>

                      <span>VS</span>

                      <strong>
                        {formatNumber(
                          second?.operations
                        )}
                      </strong>

                    </div>
                  </article>
                );
              })}

            </section>

            <section className="benchmark-footer">

              <div>
                <span>BENCHMARK NOTE</span>

                <p>
                  Execution time is measured on the
                  backend using high-resolution performance
                  timing. Results can vary between runs
                  depending on system workload.
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