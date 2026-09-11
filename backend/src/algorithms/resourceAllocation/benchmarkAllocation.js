import { fordFulkerson } from "./fordFulkerson.js";
import { greedyBottleneck } from "./greedyBottleneck.js";

const generateGraph = (size) => {

    const graph = {};

    const source = "S";
    const sink = "T";

    graph[source] = [];

    // Create intermediate resource nodes
    for (let i = 1; i <= size; i++) {

        graph[`N${i}`] = [];

        graph[source].push({
            node: `N${i}`,
            capacity: 50 + (i % 5) * 20
        });
    }

    // Connect resource nodes toward sink
    for (let i = 1; i <= size; i++) {

        graph[`N${i}`].push({
            node: sink,
            capacity: 40 + (i % 4) * 20
        });
    }

    graph[sink] = [];

    return graph;
};

const benchmark = (
    algorithm,
    graph,
    source,
    sink
) => {

    const start =
        performance.now();

    const result =
        algorithm(
            graph,
            source,
            sink
        );

    const end =
        performance.now();

    return {
        executionTimeMs:
            end - start,

        operations:
            result.operations,

        maxFlow:
            result.maxFlow ??
            result.totalFlow
    };
};

const datasetSizes = [
    20,
    100,
    500,
    1000
];

for (const size of datasetSizes) {

    const graph =
        generateGraph(size);

    console.log(
        `\n===== RESOURCE NETWORK: ${size} NODES =====`
    );

    const fordResult =
        benchmark(
            fordFulkerson,
            graph,
            "S",
            "T"
        );

    console.log(
        "Ford-Fulkerson:",
        fordResult
    );

    const greedyResult =
        benchmark(
            greedyBottleneck,
            graph,
            "S",
            "T"
        );

    console.log(
        "Greedy Bottleneck:",
        greedyResult
    );
}