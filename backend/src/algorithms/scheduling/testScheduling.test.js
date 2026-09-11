import { describe, expect, test } from "vitest";
import { greedyScheduling } from "./greedyScheduling.js";
import { dpScheduling } from "./dpScheduling.js";

const priorityValues = {
    Emergency: 4,
    High: 3,
    Medium: 2,
    Low: 1
};

const schedulingAlgorithms = [
    ["greedy scheduling", greedyScheduling],
    ["dynamic programming scheduling", dpScheduling]
];

const getScheduledJobs = (result) =>
    result.scheduledJobs || result.scheduled;

const getUnscheduledIds = (result) =>
    result.unscheduledJobs
        ? result.unscheduledJobs.map((job) => job.id)
        : result.unscheduled;

const expectScheduleInvariants = (result, jobs) => {
    const scheduledJobs = getScheduledJobs(result);
    const unscheduledIds = getUnscheduledIds(result);
    const scheduledIds = scheduledJobs.map((job) => job.id);
    const allJobIds = jobs.map((job) => job.id);

    expect(result.operations).toEqual(expect.any(Number));
    expect(new Set(scheduledIds).size).toBe(scheduledIds.length);
    expect(new Set(unscheduledIds).size).toBe(unscheduledIds.length);
    expect(new Set([
        ...scheduledIds,
        ...unscheduledIds
    ])).toEqual(new Set(allJobIds));
    expect(new Set(scheduledIds).size + unscheduledIds.length).toBe(
        allJobIds.length
    );

    for (let index = 0; index < scheduledJobs.length; index++) {
        const job = scheduledJobs[index];

        expect(new Date(job.end_time).getTime()).toBeLessThanOrEqual(
            new Date(job.deadline).getTime()
        );

        if (index > 0) {
            expect(new Date(job.start_time).getTime()).toBeGreaterThanOrEqual(
                new Date(scheduledJobs[index - 1].end_time).getTime()
            );
        }
    }

    if ("totalPriorityValue" in result) {
        expect(result.totalPriorityValue).toBe(
            scheduledJobs.reduce(
                (total, job) => total + (priorityValues[job.priority] || 1),
                0
            )
        );
    }
};

describe.each(schedulingAlgorithms)(
    "%s",
    (_name, schedule) => {
        test("schedules normal valid jobs", () => {
            const jobs = [
                {
                    id: 1,
                    start_time: "2026-09-09T08:00:00",
                    end_time: "2026-09-09T09:00:00",
                    deadline: "2026-09-09T10:00:00",
                    priority: "High"
                },
                {
                    id: 2,
                    start_time: "2026-09-09T09:00:00",
                    end_time: "2026-09-09T10:00:00",
                    deadline: "2026-09-09T11:00:00",
                    priority: "Medium"
                }
            ];

            const result = schedule(jobs);

            expect(getScheduledJobs(result).map((job) => job.id)).toEqual([
                1,
                2
            ]);
            expect(getUnscheduledIds(result)).toEqual([]);
            expectScheduleInvariants(result, jobs);
        });

        test("returns an empty schedule for empty input", () => {
            const result = schedule([]);

            expect(getScheduledJobs(result)).toEqual([]);
            expect(getUnscheduledIds(result)).toEqual([]);
            expect(result.operations).toBe(0);
            if ("totalPriorityValue" in result) {
                expect(result.totalPriorityValue).toBe(0);
            }
        });

        test("schedules a single valid job", () => {
            const jobs = [
                {
                    id: 1,
                    start_time: "2026-09-09T08:00:00",
                    end_time: "2026-09-09T09:00:00",
                    deadline: "2026-09-09T09:00:00",
                    priority: "Emergency"
                }
            ];

            const result = schedule(jobs);

            expect(getScheduledJobs(result).map((job) => job.id)).toEqual([1]);
            expect(getUnscheduledIds(result)).toEqual([]);
            expectScheduleInvariants(result, jobs);
        });

        test("handles overlapping jobs according to each algorithm", () => {
            const jobs = [
                {
                    id: 1,
                    start_time: "2026-09-09T08:00:00",
                    end_time: "2026-09-09T09:00:00",
                    deadline: "2026-09-09T12:00:00",
                    priority: "Low"
                },
                {
                    id: 2,
                    start_time: "2026-09-09T08:30:00",
                    end_time: "2026-09-09T10:00:00",
                    deadline: "2026-09-09T12:00:00",
                    priority: "Emergency"
                },
                {
                    id: 3,
                    start_time: "2026-09-09T10:00:00",
                    end_time: "2026-09-09T11:00:00",
                    deadline: "2026-09-09T12:00:00",
                    priority: "Medium"
                }
            ];

            const result = schedule(jobs);
            const expectedIds = schedule === greedyScheduling
                ? [1, 3]
                : [2, 3];

            expect(getScheduledJobs(result).map((job) => job.id)).toEqual(
                expectedIds
            );
            expectScheduleInvariants(result, jobs);
        });

        test("schedules all non-overlapping jobs", () => {
            const jobs = [
                {
                    id: 1,
                    start_time: "2026-09-09T08:00:00",
                    end_time: "2026-09-09T09:00:00",
                    deadline: "2026-09-09T10:00:00",
                    priority: "Low"
                },
                {
                    id: 2,
                    start_time: "2026-09-09T10:00:00",
                    end_time: "2026-09-09T11:00:00",
                    deadline: "2026-09-09T12:00:00",
                    priority: "High"
                },
                {
                    id: 3,
                    start_time: "2026-09-09T12:00:00",
                    end_time: "2026-09-09T13:00:00",
                    deadline: "2026-09-09T14:00:00",
                    priority: "Medium"
                }
            ];

            const result = schedule(jobs);

            expect(getScheduledJobs(result).map((job) => job.id)).toEqual([
                1,
                2,
                3
            ]);
            expect(getUnscheduledIds(result)).toEqual([]);
            expectScheduleInvariants(result, jobs);
        });

        test("allows touching intervals", () => {
            const jobs = [
                {
                    id: 1,
                    start_time: "2026-09-09T08:00:00",
                    end_time: "2026-09-09T09:00:00",
                    deadline: "2026-09-09T09:00:00",
                    priority: "Medium"
                },
                {
                    id: 2,
                    start_time: "2026-09-09T09:00:00",
                    end_time: "2026-09-09T10:00:00",
                    deadline: "2026-09-09T10:00:00",
                    priority: "Medium"
                }
            ];

            const result = schedule(jobs);

            expect(getScheduledJobs(result).map((job) => job.id)).toEqual([
                1,
                2
            ]);
            expectScheduleInvariants(result, jobs);
        });

        test("excludes jobs that miss their deadlines", () => {
            const jobs = [
                {
                    id: 1,
                    start_time: "2026-09-09T08:00:00",
                    end_time: "2026-09-09T10:00:00",
                    deadline: "2026-09-09T09:00:00",
                    priority: "Emergency"
                },
                {
                    id: 2,
                    start_time: "2026-09-09T09:00:00",
                    end_time: "2026-09-09T10:00:00",
                    deadline: "2026-09-09T11:00:00",
                    priority: "High"
                }
            ];

            const result = schedule(jobs);

            expect(getScheduledJobs(result).map((job) => job.id)).toEqual([
                2
            ]);
            expect(getUnscheduledIds(result)).toEqual([1]);
            expectScheduleInvariants(result, jobs);
        });

        test("handles equal-priority overlapping jobs deterministically", () => {
            const jobs = [
                {
                    id: 1,
                    start_time: "2026-09-09T08:00:00",
                    end_time: "2026-09-09T09:00:00",
                    deadline: "2026-09-09T12:00:00",
                    priority: "Low"
                },
                {
                    id: 2,
                    start_time: "2026-09-09T08:00:00",
                    end_time: "2026-09-09T10:00:00",
                    deadline: "2026-09-09T12:00:00",
                    priority: "Low"
                }
            ];

            const result = schedule(jobs);

            expect(getScheduledJobs(result).map((job) => job.id)).toEqual([
                1
            ]);
            expect(getUnscheduledIds(result)).toEqual([2]);
            expectScheduleInvariants(result, jobs);
        });

        test("applies deadline and overlap rules to a reversed interval", () => {
            const jobs = [
                {
                    id: 1,
                    start_time: "2026-09-09T10:00:00",
                    end_time: "2026-09-09T09:00:00",
                    deadline: "2026-09-09T12:00:00",
                    priority: "Low"
                }
            ];

            const result = schedule(jobs);

            expect(getScheduledJobs(result).map((job) => job.id)).toEqual([
                1
            ]);
            expect(getUnscheduledIds(result)).toEqual([]);
            expectScheduleInvariants(result, jobs);
        });
    }
);

test("dynamic programming finds the known maximum-priority schedule", () => {
    const jobs = [
        {
            id: 1,
            start_time: "2026-09-09T08:00:00",
            end_time: "2026-09-09T10:00:00",
            deadline: "2026-09-09T12:00:00",
            priority: "High"
        },
        {
            id: 2,
            start_time: "2026-09-09T10:00:00",
            end_time: "2026-09-09T11:00:00",
            deadline: "2026-09-09T12:00:00",
            priority: "Low"
        },
        {
            id: 3,
            start_time: "2026-09-09T08:00:00",
            end_time: "2026-09-09T09:00:00",
            deadline: "2026-09-09T12:00:00",
            priority: "Low"
        },
        {
            id: 4,
            start_time: "2026-09-09T09:00:00",
            end_time: "2026-09-09T12:00:00",
            deadline: "2026-09-09T12:00:00",
            priority: "Emergency"
        }
    ];

    const result = dpScheduling(jobs);

    expect(result.scheduled.map((job) => job.id)).toEqual([3, 4]);
    expect(result.unscheduled).toEqual([1, 2]);
    expect(result.totalPriorityValue).toBe(5);
    expectScheduleInvariants(result, jobs);
});