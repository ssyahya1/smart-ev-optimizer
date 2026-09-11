import { maxHeapPower } from "./maxHeapPower.js";
import { roundRobinPower } from "./roundRobinPower.js";


const vehicles = [
    {
        id: 1,
        priorityValue: 100,
        requested_power_kw: 120
    },
    {
        id: 2,
        priorityValue: 80,
        requested_power_kw: 100
    },
    {
        id: 3,
        priorityValue: 60,
        requested_power_kw: 80
    },
    {
        id: 4,
        priorityValue: 40,
        requested_power_kw: 60
    }
];


const availablePowerKw = 250;


console.log("===== MAX-HEAP POWER ALLOCATION =====");

const maxHeapResult = maxHeapPower(
    vehicles,
    availablePowerKw
);

console.log(maxHeapResult);


console.log("\n===== ROUND-ROBIN POWER ALLOCATION =====");

const roundRobinResult = roundRobinPower(
    vehicles,
    availablePowerKw
);

console.log(roundRobinResult);