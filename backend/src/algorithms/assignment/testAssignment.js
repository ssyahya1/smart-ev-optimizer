import { greedyAssignment } from "./greedyAssignment.js";
import { priorityQueueAssignment } from "./priorityQueueAssignment.js";

const vehicles = [
    {
        id: 1,
        priority: "Emergency",
        required_power_kw: 120
    },
    {
        id: 2,
        priority: "High",
        required_power_kw: 80
    },
    {
        id: 3,
        priority: "Medium",
        required_power_kw: 40
    },
    {
        id: 4,
        priority: "Low",
        required_power_kw: 100
    }
];

const chargingBays = [
    {
        id: 1,
        status: "available",
        max_power_kw: 150
    },
    {
        id: 2,
        status: "available",
        max_power_kw: 100
    },
    {
        id: 3,
        status: "available",
        max_power_kw: 50
    }
];

console.log("===== GREEDY ASSIGNMENT =====");

const greedyResult = greedyAssignment(
    vehicles,
    chargingBays
);

console.log(greedyResult);


console.log("\n===== PRIORITY QUEUE ASSIGNMENT =====");

const priorityResult = priorityQueueAssignment(
    vehicles,
    chargingBays
);

console.log(priorityResult);