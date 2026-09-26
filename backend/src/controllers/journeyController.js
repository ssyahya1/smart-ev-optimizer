import { z } from "zod";

import { aStar } from "../algorithms/journey/aStar.js";
import { bellmanFord } from "../algorithms/journey/bellmanFord.js";

const MAX_JOURNEY_NODES = 100;
const MAX_JOURNEY_EDGES = 1000;
const MAX_ROUTE_WEIGHT = 1_000_000;

const journeySchema = z.object({

    graph: z.record(
        z.string().min(1).max(64),
        z.array(
            z.object({
                node: z.string().min(1).max(64),
                weight: z.number().finite().positive().max(MAX_ROUTE_WEIGHT)
            })
        ).max(MAX_JOURNEY_EDGES)
    ),

    source: z.string().min(1).max(64),

    destination: z.string().min(1).max(64),

    heuristic: z.record(
        z.string().min(1).max(64),
        z.number().finite().nonnegative().max(MAX_ROUTE_WEIGHT)
    )

}).superRefine(({ graph, source, destination }, context) => {
    const entries = Object.entries(graph);
    const edgeCount = entries.reduce((total, [, edges]) => total + edges.length, 0);

    if (entries.length > MAX_JOURNEY_NODES) {
        context.addIssue({ code: "custom", path: ["graph"], message: "Too many locations" });
    }

    if (edgeCount > MAX_JOURNEY_EDGES) {
        context.addIssue({ code: "custom", path: ["graph"], message: "Too many route connections" });
    }

    if (!Object.hasOwn(graph, source)) {
        context.addIssue({ code: "custom", path: ["source"], message: "Starting location is not in the route network" });
    }

    if (!Object.hasOwn(graph, destination)) {
        context.addIssue({ code: "custom", path: ["destination"], message: "Destination is not in the route network" });
    }

    if (entries.length <= MAX_JOURNEY_NODES && edgeCount <= MAX_JOURNEY_EDGES) {
        for (const [node, edges] of entries) {
            for (const edge of edges) {
                if (!Object.hasOwn(graph, edge.node)) {
                    context.addIssue({
                        code: "custom",
                        path: ["graph", node],
                        message: "Route connection references an unknown location"
                    });
                }
            }
        }
    }
});


export const runJourneyOptimization = (
    req,
    res,
    next
) => {

    try {

        const validation =
            journeySchema.safeParse(req.body);


        if (!validation.success) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid journey optimization data",

                errors:
                    validation.error.flatten()

            });

        }


        const {
            graph,
            source,
            destination,
            heuristic
        } = validation.data;


        /*
         * The heuristic is converted into a function
         * because A* expects a heuristic function.
         */

        const heuristicFunction = (node) => {

            return heuristic[node] ?? 0;

        };


        const aStarResult =
            aStar(
                graph,
                source,
                destination,
                heuristicFunction
            );


        const bellmanFordResult =
            bellmanFord(
                graph,
                source,
                destination
            );


        return res.status(200).json({

            success: true,

            source,

            destination,

            aStar: aStarResult,

            bellmanFord: bellmanFordResult

        });

    } catch (error) {

        next(error);
    }
};