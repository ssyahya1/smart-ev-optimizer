import { z } from "zod";

import { bfs } from "../algorithms/routing/bfs.js";
import { dijkstra } from "../algorithms/routing/di jkstra.js";


const routingSchema = z.object({

    graph: z.record(
        z.string(),
        z.array(
            z.object({
                node: z.string().min(1),
                weight: z.number().positive()
            })
        )
    ),

    source: z.string().min(1),

    destination: z.string().min(1)

});


export const runRouting = (
    req,
    res,
    next
) => {

    try {

        const validation =
            routingSchema.safeParse(req.body);


        if (!validation.success) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid routing data",

                errors:
                    validation.error.flatten()

            });

        }


        const {
            graph,
            source,
            destination
        } = validation.data;


        /*
         * BFS only needs the connected nodes.
         *
         * Dijkstra needs the weighted graph.
         */

        const bfsGraph = {};

        for (const node of Object.keys(graph)) {

            bfsGraph[node] =
                graph[node].map(
                    (edge) => edge.node
                );

        }


        const bfsResult =
            bfs(
                bfsGraph,
                source,
                destination
            );


        const dijkstraResult =
            dijkstra(
                graph,
                source,
                destination
            );


        return res.status(200).json({

            success: true,

            source,

            destination,

            bfs: bfsResult,

            dijkstra: dijkstraResult

        });

    } catch (error) {

        next(error);
    }
};