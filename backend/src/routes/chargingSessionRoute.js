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

router.use(authMiddleware);

router.post("/", createChargingSession);

router.get("/", getChargingSessions);

router.get("/:id", getChargingSessionById);

router.put("/:id", updateChargingSession);

router.delete("/:id", deleteChargingSession);

export default router;