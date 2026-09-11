
import { bfs } from "./bfs.js";
import { dijkstra } from "./di jkstra.js";


// --------------------------------------------------
// Generate a realistic branching EV road network
// --------------------------------------------------

const generateGraphs = (nodeCount) => {

    const unweightedGraph = {};
    const weightedGraph = {};

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {

        const node = `N${i}`;

        unweightedGraph[node] = [];
        weightedGraph[node] = [];
    }

    // Create branching connections
    for (let i = 0; i < nodeCount - 1; i++) {

        const current = `N${i}`;
        const next = `N${i + 1}`;

        const weight =
            5 + ((i * 7) % 25);

        // Forward connection
        unweightedGraph[current].push(next);

        weightedGraph[current].push({
            node: next,
            weight
        });

        // Add additional branching edge
        if (i + 2 < nodeCount) {

            const branch = `N${i + 2}`;

            const branchWeight =
                8 + ((i * 11) % 30);

            unweightedGraph[current].push(
                branch
            );

            weightedGraph[current].push({
                node: branch,
                weight: branchWeight
            });
        }

        // Add occasional longer branch
        if (
            i % 5 === 0 &&
            i + 5 < nodeCount
        ) {

            const longBranch = `N${i + 5}`;

            const longBranchWeight =
                15 + ((i * 13) % 35);

            unweightedGraph[current].push(
                longBranch
            );

            weightedGraph[current].push({
                node: longBranch,
                weight: longBranchWeight
            });
        }
    }

    return {
        unweightedGraph,
        weightedGraph
    };
};


// --------------------------------------------------
// Benchmark
// --------------------------------------------------

const benchmark = (nodeCount) => {

    const {
        unweightedGraph,
        weightedGraph
    } = generateGraphs(nodeCount);

    const source = "N0";
    const destination = `N${nodeCount - 1}`;


    console.log(
        `\n===== GRAPH: ${nodeCount} NODES =====`
    );


    // ==============================================
    // BFS
    // ==============================================

    const bfsStart =
        process.hrtime.bigint();

    const bfsResult =
        bfs(
            unweightedGraph,
            source,
            destination
        );

    const bfsEnd =
        process.hrtime.bigint();

    const bfsTime =
        Number(
            bfsEnd - bfsStart
        ) / 1_000_000;


    console.log("BFS:", {
        executionTimeMs:
            Number(
                bfsTime.toFixed(4)
            ),

        operations:
            bfsResult.operations,

        pathLength:
            bfsResult.path.length,

        distance:
            bfsResult.distance
    });


    // ==============================================
    // DIJKSTRA
    // ==============================================

    const dijkstraStart =
        process.hrtime.bigint();

    const dijkstraResult =
        dijkstra(
            weightedGraph,
            source,
            destination
        );

    const dijkstraEnd =
        process.hrtime.bigint();

    const dijkstraTime =
        Number(
            dijkstraEnd - dijkstraStart
        ) / 1_000_000;


    console.log("Dijkstra:", {
        executionTimeMs:
            Number(
                dijkstraTime.toFixed(4)
            ),

        operations:
            dijkstraResult.operations,

        pathLength:
            dijkstraResult.path.length,

        distance:
            dijkstraResult.distance
    });
};


// --------------------------------------------------
// Required project datasets
// --------------------------------------------------

benchmark(20);
benchmark(100);
benchmark(500);
benchmark(1000);