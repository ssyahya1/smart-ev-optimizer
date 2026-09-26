
import pool from "../config/database.js";
import { z } from "zod";

const vehicleSchema = z.object({
    vehicle_number: z.string().trim().min(1).max(50),
    arrival_time: z.string(),
    initial_soc: z.number().min(0).max(100),
    battery_capacity_kwh: z.number().positive(),
    priority: z.enum(["Emergency", "High", "Medium", "Low"]),
    deadline: z.string()
});



export const registerVehicle = async (req, res, next) => {
    try {
        const {
            vehicle_number,
            arrival_time,
            initial_soc,
            battery_capacity_kwh,
            priority,
            deadline
        } = req.body;

        const result = vehicleSchema.safeParse({
            vehicle_number,
            arrival_time,
            initial_soc,
            battery_capacity_kwh,
            priority,
            deadline
        });

        if (!result.success) {
            return res.status(400).json({
                message: "Validation Failed",
                error: result.error
            });
        }

        const addVehicle = await pool.query(
            `
            INSERT INTO vehicles
                (
                    vehicle_number,
                    arrival_time,
                    initial_soc,
                    battery_capacity_kwh,
                    priority,
                    deadline,
                    user_id
                )
            VALUES
                ($1, $2, $3, $4, $5, $6, $7)

            RETURNING
                id,
                vehicle_number,
                arrival_time,
                initial_soc,
                battery_capacity_kwh,
                priority,
                deadline,
                user_id
            `,
            [
                vehicle_number,
                arrival_time,
                initial_soc,
                battery_capacity_kwh,
                priority,
                deadline,
                req.user.id
            ]
        );

        return res.status(201).json({
            message: "Vehicle created successfully",
            vehicle: addVehicle.rows[0]
        });

    } catch (error) {
        next(error);
    }
};



export const getVehicles = async (req, res, next) => {
    try {
        const result = await pool.query(
            `
            SELECT
                id,
                vehicle_number,
                arrival_time,
                initial_soc,
                battery_capacity_kwh,
                priority,
                deadline
            FROM vehicles
            WHERE user_id = $1
            ORDER BY id
            `,
            [req.user.id]
        );

        return res.status(200).json({
            vehicles: result.rows
        });

    } catch (error) {
        next(error);
    }
};



export const getVehicleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                vehicle_number,
                arrival_time,
                initial_soc,
                battery_capacity_kwh,
                priority,
                deadline
            FROM vehicles
            WHERE id = $1
            AND user_id = $2
            `,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        return res.status(200).json({
            vehicle: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};



export const updateVehicle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            vehicle_number,
            arrival_time,
            initial_soc,
            battery_capacity_kwh,
            priority,
            deadline
        } = req.body;

        const result = vehicleSchema.safeParse({
            vehicle_number,
            arrival_time,
            initial_soc,
            battery_capacity_kwh,
            priority,
            deadline
        });

        if (!result.success) {
            return res.status(400).json({
                message: "Validation Failed",
                error: result.error
            });
        }

        const updatedVehicle = await pool.query(
            `
            UPDATE vehicles
            SET
                vehicle_number = $1,
                arrival_time = $2,
                initial_soc = $3,
                battery_capacity_kwh = $4,
                priority = $5,
                deadline = $6
            WHERE id = $7
            AND user_id = $8

            RETURNING
                id,
                vehicle_number,
                arrival_time,
                initial_soc,
                battery_capacity_kwh,
                priority,
                deadline
            `,
            [
                vehicle_number,
                arrival_time,
                initial_soc,
                battery_capacity_kwh,
                priority,
                deadline,
                id,
                req.user.id
            ]
        );

        if (updatedVehicle.rows.length === 0) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        return res.status(200).json({
            message: "Vehicle updated successfully",
            vehicle: updatedVehicle.rows[0]
        });

    } catch (error) {
        next(error);
    }
};



export const deleteVehicle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM vehicles
            WHERE id = $1
            AND user_id = $2

            RETURNING
                id,
                vehicle_number
            `,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        return res.status(200).json({
            message: "Vehicle deleted successfully",
            vehicle: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};
