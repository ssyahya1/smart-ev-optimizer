
import { greedyScheduling } from "./greedyScheduling.js";
import { dpScheduling } from "./dpScheduling.js";

const generateJobs = (count) => {

    const jobs = [];

    const priorities = [
        "Emergency",
        "High",
        "Medium",
        "Low"
    ];

    for (let i = 1; i <= count; i++) {

        const startHour = 8 + ((i - 1) % 12);

        const startTime =
            new Date(
                `2026-09-09T${String(startHour).padStart(2, "0")}:00:00`
            );

        const endTime =
            new Date(startTime);

        endTime.setHours(
            endTime.getHours() + 1
        );

        const deadline =
            new Date(endTime);

        deadline.setHours(
            deadline.getHours() + 2
        );

        jobs.push({
            id: i,
            vehicle_id: i,

            start_time:
                startTime.toISOString().slice(0, 19),

            end_time:
                endTime.toISOString().slice(0, 19),

            deadline:
                deadline.toISOString().slice(0, 19),

            priority:
                priorities[(i - 1) % priorities.length]
        });
    }

    return jobs;
};


const benchmark = (jobCount) => {

    const jobs = generateJobs(jobCount);

    console.log(
        `\n===== DATASET: ${jobCount} JOBS =====`
    );

    // -----------------------------
    // GREEDY
    // -----------------------------

    const greedyStart = process.hrtime.bigint();

    const greedyResult =
        greedyScheduling(jobs);

    const greedyEnd = process.hrtime.bigint();

    const greedyTime =
        Number(greedyEnd - greedyStart) / 1_000_000;

    console.log("Greedy:", {
        executionTimeMs: greedyTime,
        operations: greedyResult.operations,
        scheduledJobs:
            greedyResult.scheduledJobs.length,
        unscheduledJobs:
            greedyResult.unscheduledJobs.length
    });


    // -----------------------------
    // DYNAMIC PROGRAMMING
    // -----------------------------

    const dpStart = process.hrtime.bigint();

    const dpResult =
        dpScheduling(jobs);

    const dpEnd = process.hrtime.bigint();

    const dpTime =
        Number(dpEnd - dpStart) / 1_000_000;

    console.log("DP:", {
        executionTimeMs: dpTime,
        operations: dpResult.operations,
        scheduledJobs:
            dpResult.scheduled.length,
        unscheduledJobs:
            dpResult.unscheduled.length,
        totalPriorityValue:
            dpResult.totalPriorityValue
    });
};


benchmark(20);
benchmark(100);
benchmark(500);
benchmark(1000);
