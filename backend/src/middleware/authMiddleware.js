import jwt from "jsonwebtoken";
import pool from "../config/database.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies[process.env.COOKIE_NAME];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        
        const result = await pool.query(
            "SELECT id, role FROM users WHERE id = $1",
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        // Use the current database values
        req.user = {
            id: user.id,
            role: user.role
        };

        next();

    } catch (error) {
        console.error("Auth middleware error:", error);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};