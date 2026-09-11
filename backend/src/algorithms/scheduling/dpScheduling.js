// Dynamic Programming Charging Schedule
// Maximizes the total priority value of scheduled vehicles.
//
// Priority values:
// Emergency = 4
// High      = 3
// Medium    = 2
// Low       = 1

const priorityValue = {
    Emergency: 4,
    High: 3,
    Medium: 2,
    Low: 1
};

export const dpScheduling = (chargingJobs) => {

    const jobs = chargingJobs
        .filter(
            (job) =>
                new Date(job.end_time) <=
                new Date(job.deadline)
        )
        .map((job) => ({
            ...job,
            value: priorityValue[job.priority] || 1
        }))
        .sort(
            (a, b) =>
                new Date(a.end_time) -
                new Date(b.end_time)
        );

    const n = jobs.length;

    const dp = new Array(n + 1).fill(0);

    let operations = 0;

    // Find the latest job that does not overlap
    const findPreviousJob = (index) => {

        for (let j = index - 1; j >= 0; j--) {

            operations++;

            if (
                new Date(jobs[j].end_time) <=
                new Date(jobs[index].start_time)
            ) {
                return j;
            }
        }

        return -1;
    };

    // Build DP table
    for (let i = 1; i <= n; i++) {

        const currentJob = jobs[i - 1];

        const previousIndex =
            findPreviousJob(i - 1);

        const includeValue =
            currentJob.value +
            (
                previousIndex >= 0
                    ? dp[previousIndex + 1]
                    : 0
            );

        const excludeValue =
            dp[i - 1];

        operations++;

        dp[i] = Math.max(
            includeValue,
            excludeValue
        );
    }

    // Reconstruct selected schedule
    const scheduled = [];

    let i = n;

    while (i > 0) {

        operations++;

        if (dp[i] === dp[i - 1]) {

            i--;

        } else {

            const job = jobs[i - 1];

            scheduled.unshift(job);

            const previousIndex =
                findPreviousJob(i - 1);

            i = previousIndex + 1;
        }
    }

    const scheduledIds = new Set(
        scheduled.map((job) => job.id)
    );

    const unscheduled = chargingJobs
        .filter(
            (job) => !scheduledIds.has(job.id)
        )
        .map(
            (job) => job.id
        );

    return {
        scheduled,
        unscheduled,
        totalPriorityValue: dp[n],
        operations
    };
};