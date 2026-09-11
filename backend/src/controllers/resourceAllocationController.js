import { z } from "zod";

import { fordFulkerson } from "../algorithms/resourceAllocation/fordFulkerson.js";
import { greedyBottleneck } from "../algorithms/resourceAllocation/greedyBottleneck.js";


const resourceAllocationSchema = z.object({

    graph: z.record(
        z.string(),
        z.array(
            z.object({
                node: z.string().min(1),
                capacity: z.number().positive()
            })
        )
    ),

    source: z.string().min(1),

    sink: z.string().min(1)

});


export const runResourceAllocation = (
    req,
    res,
    next
) => {

    try {

        const validation =
            resourceAllocationSchema.safeParse(
                req.body
            );


        if (!validation.success) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid resource allocation data",

                errors:
                    validation.error.flatten()

            });

        }


        const {
            graph,
            source,
            sink
        } = validation.data;


        const fordFulkersonResult =
            fordFulkerson(
                graph,
                source,
                sink
            );


        const greedyResult =
            greedyBottleneck(
                graph,
                source,
                sink
            );


        return res.status(200).json({

            success: true,

            source,

            sink,

            fordFulkerson:
                fordFulkersonResult,

            greedyBottleneck:
                greedyResult

        });

    } catch (error) {

        next(error);
    }
};