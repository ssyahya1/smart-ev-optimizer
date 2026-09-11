import { z } from "zod";

import { aStar } from "../algorithms/journey/aStar.js";
import { bellmanFord } from "../algorithms/journey/bellmanFord.js";


const journeySchema = z.object({

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

    destination: z.string().min(1),

    heuristic: z.record(
        z.string(),
        z.number().nonnegative()
    )

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