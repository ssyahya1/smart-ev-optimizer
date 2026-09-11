import { aStar } from "./aStar.js";
import { bellmanFord } from "./bellmanFord.js";

const generateGraph = (size) => {

    const graph = {};

    for (let i = 1; i <= size; i++) {

        graph[`N${i}`] = [];
    }

    for (let i = 1; i < size; i++) {

        const current = `N${i}`;
        const next = `N${i + 1}`;

        const weight =
            1 + (i % 10);

        graph[current].push({
            node: next,
            weight
        });

        graph[next].push({
            node: current,
            weight
        });
    }

    return graph;
};

const heuristic = (node, target) => {

    const nodeNumber =
        Number(node.substring(1));

    const targetNumber =
        Number(target.substring(1));

    return Math.abs(
        targetNumber - nodeNumber
    );
};

const benchmark = (
    algorithm,
    graph,
    startNode,
    targetNode,
    useHeuristic = false
) => {

    const start = performance.now();

    const result = useHeuristic
        ? algorithm(
            graph,
            startNode,
            targetNode,
            heuristic
        )
        : algorithm(
            graph,
            startNode,
            targetNode
        );

    const end = performance.now();

    return {
        executionTimeMs:
            end - start,

        operations:
            result.operations,

        pathLength:
            result.path.length,

        distance:
            result.distance,

        negativeCycle:
            result.negativeCycle ?? false
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

    const startNode = "N1";
    const targetNode =
        `N${size}`;

    console.log(
        `\n===== JOURNEY: ${size} NODES =====`
    );

    const aStarResult = benchmark(
        aStar,
        graph,
        startNode,
        targetNode,
        true
    );

    console.log(
        "A*:",
        aStarResult
    );

    const bellmanFordResult = benchmark(
        bellmanFord,
        graph,
        startNode,
        targetNode
    );

    console.log(
        "Bellman-Ford:",
        bellmanFordResult
    );
}