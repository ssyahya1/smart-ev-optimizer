import { fordFulkerson } from "./fordFulkerson.js";
import { greedyBottleneck } from "./greedyBottleneck.js";

const graph = {

    S: [
        {
            node: "A",
            capacity: 100
        },
        {
            node: "B",
            capacity: 80
        }
    ],

    A: [
        {
            node: "C",
            capacity: 70
        }
    ],

    B: [
        {
            node: "C",
            capacity: 50
        }
    ],

    C: [
        {
            node: "T",
            capacity: 100
        }
    ],

    T: []
};

console.log(
    "===== FORD-FULKERSON MAX FLOW ====="
);

const fordResult = fordFulkerson(
    graph,
    "S",
    "T"
);

console.log(fordResult);

console.log(
    "\n===== GREEDY BOTTLENECK ====="
);

const greedyResult = greedyBottleneck(
    graph,
    "S",
    "T"
);

console.log(greedyResult);