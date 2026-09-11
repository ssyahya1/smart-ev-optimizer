
import { greedyScheduling } from "./greedyScheduling.js";
import { dpScheduling } from "./dpScheduling.js";

const chargingJobs = [
    {
        id: 1,
        vehicle_id: 1,
        start_time: "2026-09-09T08:00:00",
        end_time: "2026-09-09T09:00:00",
        deadline: "2026-09-09T12:00:00",
        priority: "Low"
    },
    {
        id: 2,
        vehicle_id: 2,
        start_time: "2026-09-09T08:30:00",
        end_time: "2026-09-09T10:30:00",
        deadline: "2026-09-09T12:00:00",
        priority: "Emergency"
    },
    {
        id: 3,
        vehicle_id: 3,
        start_time: "2026-09-09T09:00:00",
        end_time: "2026-09-09T10:00:00",
        deadline: "2026-09-09T11:00:00",
        priority: "Medium"
    },
    {
        id: 4,
        vehicle_id: 4,
        start_time: "2026-09-09T10:00:00",
        end_time: "2026-09-09T11:00:00",
        deadline: "2026-09-09T13:00:00",
        priority: "High"
    },
    {
        id: 5,
        vehicle_id: 5,
        start_time: "2026-09-09T11:00:00",
        end_time: "2026-09-09T12:00:00",
        deadline: "2026-09-09T14:00:00",
        priority: "Low"
    }
];

console.log("===== GREEDY SCHEDULING =====");

const greedyResult = greedyScheduling(
    chargingJobs
);

console.log(greedyResult);

console.log("\n===== DYNAMIC PROGRAMMING SCHEDULING =====");

const dpResult = dpScheduling(
    chargingJobs
);

console.log(dpResult);

