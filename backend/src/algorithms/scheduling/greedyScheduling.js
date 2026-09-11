
export const greedyScheduling = (chargingJobs) => {

    let operations = 0;

    // Copy the array so the original data is not modified
    const jobs = [...chargingJobs];

    // Sort jobs by earliest finishing time
    jobs.sort(
        (a, b) =>
            new Date(a.end_time) -
            new Date(b.end_time)
    );

    const scheduledJobs = [];

    let lastEndTime = null;


    for (const job of jobs) {

        operations++;

        const startTime = new Date(job.start_time);
        const endTime = new Date(job.end_time);
        const deadline = new Date(job.deadline);


        // Job must finish before its deadline
        if (endTime > deadline) {
            continue;
        }


        // Job must not overlap the previous job
        if (
            lastEndTime === null ||
            startTime >= lastEndTime
        ) {

            scheduledJobs.push(job);

            lastEndTime = endTime;
        }
    }


    return {
        scheduledJobs,
        unscheduledJobs: jobs.filter(
            (job) =>
                !scheduledJobs.some(
                    (scheduled) =>
                        scheduled.id === job.id
                )
        ),
        operations
    };
};