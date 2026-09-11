import pool from "../config/database.js";
import {z} from "zod";





const gridSlotSchema = z.object({
    slot_time: z.string(),
    max_capacity_kw: z.number().positive(),
    electricity_price: z.number().nonnegative(),
    current_load_kw: z.number().nonnegative()
});
export const createGridSlot = async (req, res, next) => {
    try {
        const {
            slot_time,
            max_capacity_kw,
            electricity_price,
            current_load_kw
        } = req.body;

        const validation = gridSlotSchema.safeParse({
            slot_time,
            max_capacity_kw,
            electricity_price,
            current_load_kw
        });
        if (!validation.success) {
            return res.status(400).json({
                message: "Validation Failed",
                error: validation.error
            });
            }

        const result = await pool.query(
    `
    INSERT INTO grid_slots
        (
            slot_time,
            max_capacity_kw,
            electricity_price,
            current_load_kw
        )
    VALUES
        ($1, $2, $3, $4)
    RETURNING
        id,
        slot_time,
        max_capacity_kw,
        electricity_price,
        current_load_kw
    `,
    [
        slot_time,
        max_capacity_kw,
        electricity_price,
        current_load_kw
    ]
    );
    return res.status(201).json({
        message: "Grid slot created successfully",
        gridSlot: result.rows[0]
    });


    } catch (error) {
        next(error);
    }
};

export const getGridSlots = async (req, res, next) => {
    try {
        const result = await pool.query(
            `
            SELECT
                id,
                slot_time,
                max_capacity_kw,
                electricity_price,
                current_load_kw
            FROM grid_slots
            ORDER BY slot_time
            `
        );

        return res.status(200).json({
            gridSlots: result.rows
        });

    } catch (error) {
        next(error);
    }
};
export const getGridSlotById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                slot_time,
                max_capacity_kw,
                electricity_price,
                current_load_kw
            FROM grid_slots
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Grid slot not found"
            });
        }

        return res.status(200).json({
            gridSlot: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};

export const updateGridSlot = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            slot_time,
            max_capacity_kw,
            electricity_price,
            current_load_kw
        } = req.body;

        const validation = gridSlotSchema.safeParse({
            slot_time,
            max_capacity_kw,
            electricity_price,
            current_load_kw
        });

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation Failed",
                error: validation.error
            });
        }

        const result = await pool.query(
            `
            UPDATE grid_slots
            SET
                slot_time = $1,
                max_capacity_kw = $2,
                electricity_price = $3,
                current_load_kw = $4
            WHERE id = $5
            RETURNING
                id,
                slot_time,
                max_capacity_kw,
                electricity_price,
                current_load_kw
            `,
            [
                slot_time,
                max_capacity_kw,
                electricity_price,
                current_load_kw,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Grid slot not found"
            });
        }

        return res.status(200).json({
            message: "Grid slot updated successfully",
            gridSlot: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};

export const deleteGridSlot = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM grid_slots
            WHERE id = $1
            RETURNING id, slot_time
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Grid slot not found"
            });
        }

        return res.status(200).json({
            message: "Grid slot deleted successfully",
            gridSlot: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};