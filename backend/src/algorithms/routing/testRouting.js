
import { bfs } from "./bfs.js";
import { dijkstra } from "./di jkstra.js";


// --------------------------------------------------
// EV DEPOT / STATION NETWORK
// --------------------------------------------------

const unweightedGraph = {

    Depot: ["A", "B"],

    A: ["Depot", "C", "D"],

    B: ["Depot", "D", "E"],

    C: ["A", "F"],

    D: ["A", "B", "E", "F"],

    E: ["B", "D", "F"],

    F: ["C", "D", "E", "Destination"],

    Destination: ["F"]
};


// --------------------------------------------------
// WEIGHTED ROAD NETWORK
// Weight = distance / energy cost
// --------------------------------------------------

const weightedGraph = {

    Depot: [
        { node: "A", weight: 5 },
        { node: "B", weight: 3 }
    ],

    A: [
        { node: "Depot", weight: 5 },
        { node: "C", weight: 4 },
        { node: "D", weight: 8 }
    ],

    B: [
        { node: "Depot", weight: 3 },
        { node: "D", weight: 2 },
        { node: "E", weight: 7 }
    ],

    C: [
        { node: "A", weight: 4 },
        { node: "F", weight: 3 }
    ],

    D: [
        { node: "A", weight: 8 },
        { node: "B", weight: 2 },
        { node: "E", weight: 2 },
        { node: "F", weight: 5 }
    ],

    E: [
        { node: "B", weight: 7 },
        { node: "D", weight: 2 },
        { node: "F", weight: 3 }
    ],

    F: [
        { node: "C", weight: 3 },
        { node: "D", weight: 5 },
        { node: "E", weight: 3 },
        { node: "Destination", weight: 4 }
    ],

    Destination: []
};


// --------------------------------------------------
// BFS
// --------------------------------------------------

console.log("===== BFS ROUTING =====");

const bfsResult = bfs(
    unweightedGraph,
    "Depot",
    "Destination"
);

console.log(bfsResult);


// --------------------------------------------------
// DIJKSTRA
// --------------------------------------------------

console.log("\n===== DIJKSTRA ROUTING =====");

const dijkstraResult = dijkstra(
    weightedGraph,
    "Depot",
    "Destination"
);

console.log(dijkstraResult);
