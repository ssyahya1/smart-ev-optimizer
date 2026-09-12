import pool from "../config/database.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const accessTokenMaxAge = 15 * 60 * 1000;
const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000;
const refreshCookieName = process.env.REFRESH_COOKIE_NAME || "ev_optimizer_refresh_token";

const cookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge
});

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const createAccessToken = (user) => jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
);

const issueRefreshToken = async (userId) => {
    const token = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + refreshTokenMaxAge);

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, hashToken(token), expiresAt]
    );

    return token;
};

const setAuthCookies = async (res, user) => {
    const accessToken = createAccessToken(user);
    const refreshToken = await issueRefreshToken(user.id);

    res.cookie(process.env.COOKIE_NAME, accessToken, cookieOptions(accessTokenMaxAge));
    res.cookie(refreshCookieName, refreshToken, cookieOptions(refreshTokenMaxAge));
};

const registerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(72),
});

export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const result = registerSchema.safeParse({ name, email, password });

        if (!result.success) {
            return res.status(400).json({ message: "Validation Failed", error: result.error });
        }

        const existingUser = await pool.query("select id from users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const addUser = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword]
        );

        return res.status(201).json({ message: "User created successfully", user: addUser.rows[0] });
    } catch (error) {
        next(error);
    }
};

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
});

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
            return res.status(400).json({ message: "Invalid Email or password" });
        }

        const findUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (findUser.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = findUser.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        await setAuthCookies(res, user);
        return res.json({
            message: "Login successful",
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

export const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies[refreshCookieName];
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }

                const result = await pool.query(
                        `UPDATE refresh_tokens
                         SET revoked_at = CURRENT_TIMESTAMP
                         WHERE token_hash = $1
                             AND revoked_at IS NULL
                             AND expires_at > CURRENT_TIMESTAMP
                         RETURNING user_id`,
            [hashToken(refreshToken)]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }

        const userResult = await pool.query(
            "SELECT id, role FROM users WHERE id = $1",
            [result.rows[0].user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        await setAuthCookies(res, userResult.rows[0]);

        return res.status(200).json({ message: "Token refreshed" });
    } catch (error) {
        next(error);
    }
};

export const logoutUser = async (req, res, next) => {
    try {
        const refreshToken = req.cookies[refreshCookieName];
        if (refreshToken) {
            await pool.query(
                "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1 AND revoked_at IS NULL",
                [hashToken(refreshToken)]
            );
        }

        res.clearCookie(process.env.COOKIE_NAME, cookieOptions(0));
        res.clearCookie(refreshCookieName, cookieOptions(0));
        return res.status(200).json({ message: "Successfully Logout" });
    } catch (error) {
        next(error);
    }
};

export const createAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const result = registerSchema.safeParse({ name, email, password });
        if (!result.success) {
            return res.status(400).json({ message: "Validation Failed", error: result.error });
        }

        const existingUser = await pool.query("select id from users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const addAdmin = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword, "admin"]
        );

        return res.status(201).json({ message: "User created successfully", user: addAdmin.rows[0] });
    } catch (error) {
        next(error);
    }
};
