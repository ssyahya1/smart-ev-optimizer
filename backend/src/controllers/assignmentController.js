import { z } from "zod";
import pool from "../config/database.js";

import { greedyAssignment } from "../algorithms/assignment/greedyAssignment.js";
import { priorityQueueAssignment } from "../algorithms/assignment/priorityQueueAssignment.js";

const assignmentSchema = z.object({
    vehicles: z.array(
        z.object({
            id: z.number().int().positive(),

            priority: z.enum([
                "Emergency",
                "High",
                "Medium",
                "Low"
            ]),

            required_power_kw: z.number().positive()
        })
    ).max(1000),

    chargingBays: z.array(
        z.object({
            id: z.number().int().positive(),

            status: z.enum([
                "available",
                "occupied",
                "maintenance"
            ]),

            max_power_kw: z.number().positive()
        })
    ).max(100)
});


export const runAssignment = async (req, res, next) => {
    try {
        const [vehicleResult, bayResult] = await Promise.all([
            pool.query(
                `
                SELECT id, battery_capacity_kwh, initial_soc,
                       arrival_time, deadline, priority
                FROM vehicles
                WHERE user_id = $1
                ORDER BY id
                LIMIT 1000
                `,
                [req.user.id]
            ),
            pool.query(
                `
                SELECT id, status, max_power_kw
                FROM charging_bays
                WHERE status = 'available'
                ORDER BY max_power_kw, id
                LIMIT 100
                `
            )
        ]);

        const vehicles = vehicleResult.rows;
        const chargingBays = bayResult.rows;


        /*
         * Calculate required charging power.
         *
         * Energy required:
         *
         * battery capacity × remaining SoC percentage
         *
         * Required power:
         *
         * energy required / available charging time
         *
         * Minimum charging time is protected against
         * zero or negative values.
         */

        const preparedVehicles = vehicles.map((vehicle) => {

            const batteryCapacity =
                Number(vehicle.battery_capacity_kwh);

            const initialSoc =
                Number(vehicle.initial_soc);


            if (
                !Number.isFinite(batteryCapacity) ||
                batteryCapacity <= 0
            ) {
                throw new Error(
                    `Invalid battery capacity for vehicle ${vehicle.id}`
                );
            }


            if (
                !Number.isFinite(initialSoc) ||
                initialSoc < 0 ||
                initialSoc > 100
            ) {
                throw new Error(
                    `Invalid initial SoC for vehicle ${vehicle.id}`
                );
            }


            /*
             * Energy still required to fully charge.
             */

            const requiredEnergy =
                batteryCapacity *
                ((100 - initialSoc) / 100);


            /*
             * Calculate available charging time.
             */

            const arrival =
                new Date(vehicle.arrival_time);

            const deadline =
                new Date(vehicle.deadline);


            const availableHours =
                (deadline - arrival) /
                (1000 * 60 * 60);


            /*
             * Prevent division by zero or negative time.
             */

            const chargingHours =
                Math.max(availableHours, 0.25);


            const requiredPower =
                requiredEnergy /
                chargingHours;


            return {
                id: Number(vehicle.id),

                priority: vehicle.priority,

                required_power_kw:
                    Number(requiredPower.toFixed(2))
            };
        });


        /*
         * Prepare charging bay data.
         */

        const preparedBays = chargingBays.map((bay) => {

            return {
                id: Number(bay.id),

                status: bay.status,

                max_power_kw:
                    Number(bay.max_power_kw)
            };
        });


        /*
         * Validate the exact data structure expected
         * by the assignment algorithms.
         */

        const validation =
            assignmentSchema.safeParse({
                vehicles: preparedVehicles,
                chargingBays: preparedBays
            });


        if (!validation.success) {

            return res.status(400).json({
                success: false,
                message: "Invalid assignment data",
                errors: validation.error.flatten()
            });
        }


        const {
            vehicles: validatedVehicles,
            chargingBays: validatedBays
        } = validation.data;


        // Keep both strategies internal and return plan-oriented fields.

        const greedyResult =
            greedyAssignment(
                validatedVehicles,
                validatedBays
            );


        const priorityQueueResult =
            priorityQueueAssignment(
                validatedVehicles,
                validatedBays
            );


        return res.status(200).json({
            success: true,
            recommendedPlan: {
                assignments: priorityQueueResult.assignments,
                unassignedVehicles: priorityQueueResult.unassignedVehicles,
            },
            alternativePlan: {
                assignments: greedyResult.assignments,
                unassignedVehicles: greedyResult.unassignedVehicles,
            },
        });

    } catch (error) {

        next(error);

    }
};