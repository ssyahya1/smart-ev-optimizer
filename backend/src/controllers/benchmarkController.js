import { z } from "zod";

import { greedyAssignment } from "../algorithms/assignment/greedyAssignment.js";
import { priorityQueueAssignment } from "../algorithms/assignment/priorityQueueAssignment.js";

import { greedyScheduling } from "../algorithms/scheduling/greedyScheduling.js";
import { dpScheduling } from "../algorithms/scheduling/dpScheduling.js";

import { maxHeapPower } from "../algorithms/power/maxHeapPower.js";
import { roundRobinPower } from "../algorithms/power/roundRobinPower.js";

import { bfs } from "../algorithms/routing/bfs.js";
import { dijkstra } from "../algorithms/routing/di jkstra.js";

import { aStar } from "../algorithms/journey/aStar.js";
import { bellmanFord } from "../algorithms/journey/bellmanFord.js";

import { fordFulkerson } from "../algorithms/resourceAllocation/fordFulkerson.js";
import { greedyBottleneck } from "../algorithms/resourceAllocation/greedyBottleneck.js";


const benchmarkSchema = z.object({

    datasetSize:
        z.number()
        .int()
        .refine(
            (value) =>
                [20, 100, 500, 1000].includes(value),
            {
                message:
                    "Dataset size must be 20, 100, 500, or 1000"
            }
        )

});


const measureExecution = (algorithm) => {

    const start =
        performance.now();

    const result =
        algorithm();

    const end =
        performance.now();

    return {

        result,

        executionTimeMs:
            Number(
                (end - start).toFixed(4)
            )

    };
};


const generateVehicles = (size) => {

    const priorities = [
        "Emergency",
        "High",
        "Medium",
        "Low"
    ];

    return Array.from(
        { length: size },
        (_, index) => ({

            id: index + 1,

            priority:
                priorities[index % 4],

            required_power_kw:
                40 + (index % 4) * 20,

            requested_power_kw:
                60 + (index % 5) * 20

        })
    );
};


const generateBays = (size) => {

    const bayCount =
        Math.max(
            5,
            Math.ceil(size / 20)
        );

    return Array.from(
        { length: bayCount },
        (_, index) => ({

            id: index + 1,

            status: "available",

            max_power_kw:
                50 + (index % 3) * 50

        })
    );
};


const generateJobs = (size) => {

    const priorities = [
        "Emergency",
        "High",
        "Medium",
        "Low"
    ];

    return Array.from(
        { length: size },
        (_, index) => {

            const start =
                new Date(
                    `2026-09-09T08:00:00.000Z`
                );

            start.setMinutes(
                start.getMinutes() + index * 5
            );

            const end =
                new Date(start);

            end.setMinutes(
                end.getMinutes() + 30
            );

            const deadline =
                new Date(end);

            deadline.setHours(
                deadline.getHours() + 2
            );

            return {

                id: index + 1,

                vehicle_id:
                    index + 1,

                start_time:
                    start.toISOString(),

                end_time:
                    end.toISOString(),

                deadline:
                    deadline.toISOString(),

                priority:
                    priorities[index % 4]

            };
        }
    );
};


const generateRoutingGraph = (size) => {

    const graph = {};

    for (let i = 0; i < size; i++) {

        graph[`N${i}`] = [];
    }

    for (let i = 0; i < size - 1; i++) {

        graph[`N${i}`].push({

            node: `N${i + 1}`,

            weight:
                (i % 20) + 1

        });

        if (i + 2 < size) {

            graph[`N${i}`].push({

                node: `N${i + 2}`,

                weight:
                    ((i + 5) % 30) + 1

            });
        }
    }

    return graph;
};


const generateResourceGraph = (size) => {

    const graph = {};

    graph.S = [];

    graph.T = [];

    const middleCount =
        Math.max(
            2,
            Math.floor(size / 2)
        );

    for (let i = 0; i < middleCount; i++) {

        const node =
            `N${i}`;

        graph[node] = [];

        graph.S.push({

            node,

            capacity:
                100

        });

        graph[node].push({

            node: "T",

            capacity:
                100

        });
    }

    return graph;
};


export const runBenchmark = (
    req,
    res,
    next
) => {

    try {

        const validation =
            benchmarkSchema.safeParse(
                req.body
            );


        if (!validation.success) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid benchmark data",

                errors:
                    validation.error.flatten()

            });
        }


        const {
            datasetSize
        } = validation.data;


        /*
         * Generate benchmark datasets
         */

        const vehicles =
            generateVehicles(
                datasetSize
            );

        const bays =
            generateBays(
                datasetSize
            );

        const jobs =
            generateJobs(
                datasetSize
            );

        const routingGraph =
            generateRoutingGraph(
                datasetSize
            );

        const resourceGraph =
            generateResourceGraph(
                datasetSize
            );


        /*
         * Assignment
         */

        const assignmentGreedy =
            measureExecution(
                () =>
                    greedyAssignment(
                        vehicles,
                        bays
                    )
            );

        const assignmentPriority =
            measureExecution(
                () =>
                    priorityQueueAssignment(
                        vehicles,
                        bays
                    )
            );


        /*
         * Scheduling
         */

        const schedulingGreedy =
            measureExecution(
                () =>
                    greedyScheduling(
                        jobs
                    )
            );

        const schedulingDP =
            measureExecution(
                () =>
                    dpScheduling(
                        jobs
                    )
            );


        /*
         * Power contention
         */

        const powerMaxHeapVehicles =
            vehicles.map(
                (vehicle) => ({

                    ...vehicle,

                    priorityValue:
                        4 -
                        (
                            (vehicle.id - 1) % 4
                        )

                })
            );


        const powerMaxHeap =
            measureExecution(
                () =>
                    maxHeapPower(
                        powerMaxHeapVehicles,
                        datasetSize * 50
                    )
            );

        const powerRoundRobin =
            measureExecution(
                () =>
                    roundRobinPower(
                        powerMaxHeapVehicles,
                        datasetSize * 50
                    )
            );


        /*
         * Routing
         */

        const bfsGraph = {};

        for (
            const node
            of Object.keys(routingGraph)
        ) {

            bfsGraph[node] =
                routingGraph[node]
                    .map(
                        (edge) =>
                            edge.node
                    );
        }


        const source = "N0";

        const destination =
            `N${datasetSize - 1}`;


        const routingBFS =
            measureExecution(
                () =>
                    bfs(
                        bfsGraph,
                        source,
                        destination
                    )
            );


        const routingDijkstra =
            measureExecution(
                () =>
                    dijkstra(
                        routingGraph,
                        source,
                        destination
                    )
            );


        /*
         * Journey
         */

        const heuristic =
            (node) => {

                if (node === destination) {
                    return 0;
                }

                return 1;
            };


        const journeyAStar =
            measureExecution(
                () =>
                    aStar(
                        routingGraph,
                        source,
                        destination,
                        heuristic
                    )
            );


        const journeyBellmanFord =
            measureExecution(
                () =>
                    bellmanFord(
                        routingGraph,
                        source,
                        destination
                    )
            );


        /*
         * Resource allocation
         */

        const resourceFordFulkerson =
            measureExecution(
                () =>
                    fordFulkerson(
                        resourceGraph,
                        "S",
                        "T"
                    )
            );


        const resourceGreedy =
            measureExecution(
                () =>
                    greedyBottleneck(
                        resourceGraph,
                        "S",
                        "T"
                    )
            );


        return res.status(200).json({

            success: true,

            datasetSize,

            assignment: {

                greedy: {
                    executionTimeMs:
                        assignmentGreedy.executionTimeMs,

                    operations:
                        assignmentGreedy.result.operations
                },

                priorityQueue: {
                    executionTimeMs:
                        assignmentPriority.executionTimeMs,

                    operations:
                        assignmentPriority.result.operations
                }

            },

            scheduling: {

                greedy: {
                    executionTimeMs:
                        schedulingGreedy.executionTimeMs,

                    operations:
                        schedulingGreedy.result.operations
                },

                dynamicProgramming: {
                    executionTimeMs:
                        schedulingDP.executionTimeMs,

                    operations:
                        schedulingDP.result.operations
                }

            },

            power: {

                maxHeap: {
                    executionTimeMs:
                        powerMaxHeap.executionTimeMs,

                    operations:
                        powerMaxHeap.result.operations
                },

                roundRobin: {
                    executionTimeMs:
                        powerRoundRobin.executionTimeMs,

                    operations:
                        powerRoundRobin.result.operations
                }

            },

            routing: {

                bfs: {
                    executionTimeMs:
                        routingBFS.executionTimeMs,

                    operations:
                        routingBFS.result.operations
                },

                dijkstra: {
                    executionTimeMs:
                        routingDijkstra.executionTimeMs,

                    operations:
                        routingDijkstra.result.operations
                }

            },

            journey: {

                aStar: {
                    executionTimeMs:
                        journeyAStar.executionTimeMs,

                    operations:
                        journeyAStar.result.operations
                },

                bellmanFord: {
                    executionTimeMs:
                        journeyBellmanFord.executionTimeMs,

                    operations:
                        journeyBellmanFord.result.operations
                }

            },

            resourceAllocation: {

                fordFulkerson: {
                    executionTimeMs:
                        resourceFordFulkerson.executionTimeMs,

                    operations:
                        resourceFordFulkerson.result.operations,

                    maxFlow:
                        resourceFordFulkerson.result.maxFlow
                },

                greedyBottleneck: {
                    executionTimeMs:
                        resourceGreedy.executionTimeMs,

                    operations:
                        resourceGreedy.result.operations,

                    maxFlow:
                        resourceGreedy.result.totalFlow
                }

            }

        });

    } catch (error) {

        next(error);
    }
};