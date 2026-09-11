
import express from "express";

import {
    createChargingSession,
    getChargingSessions,
    getChargingSessionById,
    updateChargingSession,
    deleteChargingSession
} from "../controllers/chargingSessionController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";


const router = express.Router();


// Create charging session
router.post(
    "/",
    authMiddleware,
    createChargingSession
);


// Get all charging sessions
router.get(
    "/",
    authMiddleware,
    getChargingSessions
);


// Get charging session by ID
router.get(
    "/:id",
    authMiddleware,
    getChargingSessionById
);


// Update charging session
router.put(
    "/:id",
    authMiddleware,
    updateChargingSession
);


// Delete charging session
router.delete(
    "/:id",
    authMiddleware,
    deleteChargingSession
);


export default router;
