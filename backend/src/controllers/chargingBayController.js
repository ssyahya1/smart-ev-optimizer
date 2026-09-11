import pool from "../config/database.js";
import { z } from "zod";

const chargingBaySchema = z.object({
    bay_number: z.string().trim().min(1).max(50),
    charger_type: z.enum(["AC", "DC"]),
    max_power_kw: z.number().positive(),
    status: z.enum(["available", "occupied", "maintenance"]).default("available")
});


// REGISTER CHARGING BAY
export const registerChargingBay = async (req, res, next) => {
    try {
        const {
            bay_number,
            charger_type,
            max_power_kw,
            status
        } = req.body;

        const result = chargingBaySchema.safeParse({
            bay_number,
            charger_type,
            max_power_kw,
            status: status || "available"
        });

        if (!result.success) {
            return res.status(400).json({
                message: "Validation Failed",
                error: result.error
            });
        }

        const addBay = await pool.query(
            `
            INSERT INTO charging_bays
                (
                    bay_number,
                    charger_type,
                    max_power_kw,
                    status
                )
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                id,
                bay_number,
                charger_type,
                max_power_kw,
                status
            `,
            [
                bay_number,
                charger_type,
                max_power_kw,
                status || "available"
            ]
        );

        return res.status(201).json({
            message: "Charging bay created successfully",
            chargingBay: addBay.rows[0]
        });

    } catch (error) {
        next(error);
    }
};


// GET ALL CHARGING BAYS
export const getChargingBays = async (req, res, next) => {
    try {
        const result = await pool.query(
            `
            SELECT
                id,
                bay_number,
                charger_type,
                max_power_kw,
                status
            FROM charging_bays
            ORDER BY id
            `
        );

        return res.status(200).json({
            chargingBays: result.rows
        });

    } catch (error) {
        next(error);
    }
};


// GET CHARGING BAY BY ID
export const getChargingBayById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                bay_number,
                charger_type,
                max_power_kw,
                status
            FROM charging_bays
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Charging bay not found"
            });
        }

        return res.status(200).json({
            chargingBay: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};


// UPDATE CHARGING BAY
export const updateChargingBay = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            bay_number,
            charger_type,
            max_power_kw,
            status
        } = req.body;

        const result = chargingBaySchema.safeParse({
            bay_number,
            charger_type,
            max_power_kw,
            status
        });

        if (!result.success) {
            return res.status(400).json({
                message: "Validation Failed",
                error: result.error
            });
        }

        const updatedBay = await pool.query(
            `
            UPDATE charging_bays
            SET
                bay_number = $1,
                charger_type = $2,
                max_power_kw = $3,
                status = $4
            WHERE id = $5
            RETURNING
                id,
                bay_number,
                charger_type,
                max_power_kw,
                status
            `,
            [
                bay_number,
                charger_type,
                max_power_kw,
                status,
                id
            ]
        );

        if (updatedBay.rows.length === 0) {
            return res.status(404).json({
                message: "Charging bay not found"
            });
        }

        return res.status(200).json({
            message: "Charging bay updated successfully",
            chargingBay: updatedBay.rows[0]
        });

    } catch (error) {
        next(error);
    }
};


// DELETE CHARGING BAY
export const deleteChargingBay = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM charging_bays
            WHERE id = $1
            RETURNING id, bay_number
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Charging bay not found"
            });
        }

        return res.status(200).json({
            message: "Charging bay deleted successfully",
            chargingBay: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};