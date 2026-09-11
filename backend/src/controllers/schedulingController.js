
import { z } from "zod";

import { greedyScheduling } from "../algorithms/scheduling/greedyScheduling.js";
import { dpScheduling } from "../algorithms/scheduling/dpScheduling.js";



const schedulingSchema = z.object({

    chargingJobs: z.array(
        z.object({
            id: z.number().int().positive(),

            vehicle_id:
                z.number().int().positive(),

            start_time:
                z.string().datetime(),

            end_time:
                z.string().datetime(),

            deadline:
                z.string().datetime(),

            priority: z.enum([
                "Emergency",
                "High",
                "Medium",
                "Low"
            ])
        })
    ).min(1).max(1000)

});



export const runScheduling = (req, res, next) => {

    try {

        // Validate request body
        const validation =
            schedulingSchema.safeParse(req.body);


        if (!validation.success) {

            return res.status(400).json({
                success: false,
                message: "Invalid scheduling data",
                errors: validation.error.flatten()
            });
        }


        const {
            chargingJobs
        } = validation.data;



        const greedyResult =
            greedyScheduling(
                chargingJobs
            );


        const dpResult =
            dpScheduling(
                chargingJobs
            );



        return res.status(200).json({

            success: true,

            greedy: greedyResult,

            dynamicProgramming: dpResult

        });

    } catch (error) {

        next(error);
    }
};
