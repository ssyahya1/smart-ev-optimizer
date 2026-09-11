
import { aStar } from "./aStar.js";
import { bellmanFord } from "./bellmanFord.js";


// --------------------------------------------------
// EV JOURNEY NETWORK
// --------------------------------------------------

const graph = {

    Depot: [
        { node: "A", weight: 4 },
        { node: "B", weight: 6 }
    ],

    A: [
        { node: "C", weight: 5 },
        { node: "D", weight: 12 }
    ],

    B: [
        { node: "D", weight: 3 },
        { node: "E", weight: 8 }
    ],

    C: [
        { node: "F", weight: 4 }
    ],

    D: [
        { node: "F", weight: 5 },
        { node: "E", weight: 2 }
    ],

    E: [
        { node: "F", weight: 3 }
    ],

    F: [
        { node: "Destination", weight: 4 }
    ],

    Destination: []
};


// --------------------------------------------------
// A* HEURISTIC
// Estimated remaining energy/distance cost
// --------------------------------------------------

const heuristic = (node) => {

    const estimates = {
        Depot: 12,
        A: 10,
        B: 9,
        C: 8,
        D: 6,
        E: 4,
        F: 4,
        Destination: 0
    };

    return estimates[node] ?? 0;
};


// --------------------------------------------------
// A*
// --------------------------------------------------

console.log("===== A* JOURNEY OPTIMIZATION =====");

const aStarResult = aStar(
    graph,
    "Depot",
    "Destination",
    heuristic
);

console.log(aStarResult);


// --------------------------------------------------
// BELLMAN-FORD
// --------------------------------------------------

console.log("\n===== BELLMAN-FORD JOURNEY OPTIMIZATION =====");

const bellmanFordResult = bellmanFord(
    graph,
    "Depot",
    "Destination"
);

console.log(bellmanFordResult);
