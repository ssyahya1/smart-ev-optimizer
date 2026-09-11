import pool from "../config/database.js";
import { z } from "zod";


// Validation schema
const chargingSessionSchema = z.object({
    vehicle_id: z.number().int().positive(),
    charging_bay_id: z.number().int().positive(),
    grid_slot_id: z.number().int().positive().nullable(),
    start_time: z.string(),
    end_time: z.string().nullable(),
    power_kw: z.number().positive(),
    energy_delivered_kwh: z.number().nonnegative(),
    status: z.enum([
        "scheduled",
        "charging",
        "completed",
        "cancelled"
    ])
});


// CREATE CHARGING SESSION
export const createChargingSession = async (req, res, next) => {
    try {
        const {
            vehicle_id,
            charging_bay_id,
            grid_slot_id,
            start_time,
            end_time,
            power_kw,
            energy_delivered_kwh,
            status
        } = req.body;

        const validation = chargingSessionSchema.safeParse({
            vehicle_id,
            charging_bay_id,
            grid_slot_id,
            start_time,
            end_time,
            power_kw,
            energy_delivered_kwh,
            status: status || "scheduled"
        });

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation Failed",
                error: validation.error
            });
        }

        const result = await pool.query(
            `
            INSERT INTO charging_sessions
                (
                    vehicle_id,
                    charging_bay_id,
                    grid_slot_id,
                    start_time,
                    end_time,
                    power_kw,
                    energy_delivered_kwh,
                    status
                )
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                id,
                vehicle_id,
                charging_bay_id,
                grid_slot_id,
                start_time,
                end_time,
                power_kw,
                energy_delivered_kwh,
                status
            `,
            [
                vehicle_id,
                charging_bay_id,
                grid_slot_id,
                start_time,
                end_time,
                power_kw,
                energy_delivered_kwh,
                status || "scheduled"
            ]
        );

        return res.status(201).json({
            message: "Charging session created successfully",
            chargingSession: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};


// GET ALL CHARGING SESSIONS
export const getChargingSessions = async (req, res, next) => {
    try {
        const result = await pool.query(
            `
            SELECT
                id,
                vehicle_id,
                charging_bay_id,
                grid_slot_id,
                start_time,
                end_time,
                power_kw,
                energy_delivered_kwh,
                status
            FROM charging_sessions
            ORDER BY start_time
            `
        );

        return res.status(200).json({
            chargingSessions: result.rows
        });

    } catch (error) {
        next(error);
    }
};


// GET CHARGING SESSION BY ID
export const getChargingSessionById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                vehicle_id,
                charging_bay_id,
                grid_slot_id,
                start_time,
                end_time,
                power_kw,
                energy_delivered_kwh,
                status
            FROM charging_sessions
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Charging session not found"
            });
        }

        return res.status(200).json({
            chargingSession: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};


// UPDATE CHARGING SESSION
export const updateChargingSession = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            vehicle_id,
            charging_bay_id,
            grid_slot_id,
            start_time,
            end_time,
            power_kw,
            energy_delivered_kwh,
            status
        } = req.body;

        const validation = chargingSessionSchema.safeParse({
            vehicle_id,
            charging_bay_id,
            grid_slot_id,
            start_time,
            end_time,
            power_kw,
            energy_delivered_kwh,
            status
        });

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation Failed",
                error: validation.error
            });
        }

        const result = await pool.query(
            `
            UPDATE charging_sessions
            SET
                vehicle_id = $1,
                charging_bay_id = $2,
                grid_slot_id = $3,
                start_time = $4,
                end_time = $5,
                power_kw = $6,
                energy_delivered_kwh = $7,
                status = $8
            WHERE id = $9
            RETURNING
                id,
                vehicle_id,
                charging_bay_id,
                grid_slot_id,
                start_time,
                end_time,
                power_kw,
                energy_delivered_kwh,
                status
            `,
            [
                vehicle_id,
                charging_bay_id,
                grid_slot_id,
                start_time,
                end_time,
                power_kw,
                energy_delivered_kwh,
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Charging session not found"
            });
        }

        return res.status(200).json({
            message: "Charging session updated successfully",
            chargingSession: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};


// DELETE CHARGING SESSION
export const deleteChargingSession = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM charging_sessions
            WHERE id = $1
            RETURNING id
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Charging session not found"
            });
        }

        return res.status(200).json({
            message: "Charging session deleted successfully",
            chargingSession: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};