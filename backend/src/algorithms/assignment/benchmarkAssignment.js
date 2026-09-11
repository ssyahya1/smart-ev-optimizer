import { greedyAssignment } from "./greedyAssignment.js";
import { priorityQueueAssignment } from "./priorityQueueAssignment.js";


// Generate test vehicles
const generateVehicles = (count) => {

    const priorities = [
        "Emergency",
        "High",
        "Medium",
        "Low"
    ];

    const vehicles = [];

    for (let i = 1; i <= count; i++) {

        vehicles.push({
            id: i,
            priority:
                priorities[i % priorities.length],
            required_power_kw:
                40 + (i % 4) * 20
        });
    }

    return vehicles;
};


// Generate charging bays
const generateChargingBays = (count) => {

    const bays = [];

    for (let i = 1; i <= count; i++) {

        bays.push({
            id: i,
            status: "available",
            max_power_kw:
                50 + (i % 3) * 50
        });
    }

    return bays;
};


// Benchmark one algorithm
const benchmark = (
    algorithm,
    vehicles,
    chargingBays
) => {

    const start = performance.now();

    const result = algorithm(
        vehicles,
        chargingBays
    );

    const end = performance.now();

    return {
        executionTimeMs: end - start,
        operations: result.operations,
        assignedVehicles:
            result.assignments.length,
        unassignedVehicles:
            result.unassignedVehicles.length
    };
};


// Dataset sizes
const datasetSizes = [
    20,
    100,
    500,
    1000
];


for (const size of datasetSizes) {

    const vehicles = generateVehicles(size);

    // Number of bays grows with dataset size
    const bayCount = Math.ceil(size * 0.1);

    const chargingBays =
        generateChargingBays(bayCount);


    console.log(
        `\n===== DATASET: ${size} VEHICLES =====`
    );


    const greedyResult = benchmark(
        greedyAssignment,
        vehicles,
        chargingBays
    );

    console.log(
        "Greedy:",
        greedyResult
    );


    const priorityQueueResult = benchmark(
        priorityQueueAssignment,
        vehicles,
        chargingBays
    );

    console.log(
        "Priority Queue:",
        priorityQueueResult
    );
}