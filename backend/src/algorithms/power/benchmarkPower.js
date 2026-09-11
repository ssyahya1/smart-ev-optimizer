
import { maxHeapPower } from "./maxHeapPower.js";
import { roundRobinPower } from "./roundRobinPower.js";


// Generate EV charging requests
const generateVehicles = (count) => {

    const vehicles = [];

    const priorities = [
        "Emergency",
        "High",
        "Medium",
        "Low"
    ];

    for (let i = 1; i <= count; i++) {

        vehicles.push({
            id: i,

            priority:
                priorities[(i - 1) % priorities.length],

            priorityValue:
                4 - ((i - 1) % priorities.length),

            requested_power_kw:
                40 + ((i * 10) % 100)
        });
    }

    return vehicles;
};


// Run benchmark
const benchmark = (vehicleCount) => {

    const vehicles =
        generateVehicles(vehicleCount);

    const availablePower =
        vehicleCount * 35;


    console.log(
        `\n===== DATASET: ${vehicleCount} VEHICLES =====`
    );


    // =========================================
    // MAX-HEAP
    // =========================================

    const heapStart =
        process.hrtime.bigint();

    const heapResult =
        maxHeapPower(
            vehicles,
            availablePower
        );

    const heapEnd =
        process.hrtime.bigint();

    const heapTime =
        Number(
            heapEnd - heapStart
        ) / 1_000_000;

    const heapVehicleIds =
        new Set(
            heapResult.allocations.map(
                (allocation) =>
                    allocation.vehicleId
            )
        );

    console.log("Max-Heap:", {
        executionTimeMs:
            Number(heapTime.toFixed(4)),

        operations:
            heapResult.operations,

        allocationRecords:
            heapResult.allocations.length,

        uniqueVehiclesAllocated:
            heapVehicleIds.size,

        remainingPowerKw:
            heapResult.remainingPowerKw
    });


    // =========================================
    // ROUND-ROBIN
    // =========================================

    const roundRobinStart =
        process.hrtime.bigint();

    const roundRobinResult =
        roundRobinPower(
            vehicles,
            availablePower
        );

    const roundRobinEnd =
        process.hrtime.bigint();

    const roundRobinTime =
        Number(
            roundRobinEnd - roundRobinStart
        ) / 1_000_000;

    const roundRobinVehicleIds =
        new Set(
            roundRobinResult.allocations.map(
                (allocation) =>
                    allocation.vehicleId
            )
        );

    console.log("Round-Robin:", {
        executionTimeMs:
            Number(roundRobinTime.toFixed(4)),

        operations:
            roundRobinResult.operations,

        allocationRecords:
            roundRobinResult.allocations.length,

        uniqueVehiclesAllocated:
            roundRobinVehicleIds.size,

        remainingPowerKw:
            roundRobinResult.remainingPowerKw
    });
};


// =========================================
// DATASETS
// =========================================

benchmark(20);
benchmark(100);
benchmark(500);
benchmark(1000);
