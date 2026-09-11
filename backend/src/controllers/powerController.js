import { z } from "zod";

import { maxHeapPower } from "../algorithms/power/maxHeapPower.js";
import { roundRobinPower } from "../algorithms/power/roundRobinPower.js";

const powerSchema = z.object({

    vehicles: z.array(
        z.object({
            id: z.number().int().positive(),

            priority: z.enum([
                "Emergency",
                "High",
                "Medium",
                "Low"
            ]),

            requested_power_kw:
                z.number().positive().max(100000)
        })
    )
    .min(1)
    .max(1000),

    availablePower:
        z.number().positive().max(100000)
});


export const runPowerAllocation = (
    req,
    res,
    next
) => {

    try {

        const validation =
            powerSchema.safeParse(req.body);

        if (!validation.success) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid power allocation data",

                errors:
                    validation.error.flatten()

            });
        }

        const {
            vehicles,
            availablePower
        } = validation.data;


        /*
         * Convert priority into a numeric value.
         *
         * The client does NOT provide priorityValue.
         * This prevents the client from manipulating
         * the priority used by the Max-Heap algorithm.
         */

        const priorityValue = {

            Emergency: 4,
            High: 3,
            Medium: 2,
            Low: 1

        };


        const algorithmVehicles =
            vehicles.map((vehicle) => ({

                ...vehicle,

                priorityValue:
                    priorityValue[vehicle.priority]

            }));


        const maxHeapResult =
            maxHeapPower(
                algorithmVehicles,
                availablePower
            );


        const roundRobinResult =
            roundRobinPower(
                algorithmVehicles,
                availablePower
            );


        return res.status(200).json({

            success: true,

            maxHeap: maxHeapResult,

            roundRobin: roundRobinResult

        });

    } catch (error) {

        next(error);
    }
};