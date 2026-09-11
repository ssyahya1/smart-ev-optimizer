import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
    registerChargingBay,
    getChargingBays,
    getChargingBayById,
    updateChargingBay,
    deleteChargingBay
} from "../controllers/chargingBayController.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    registerChargingBay
);

router.get(
    "/",
    authMiddleware,
    getChargingBays
);

router.get(
    "/:id",
    authMiddleware,
    getChargingBayById
);

router.put(
    "/:id",
    authMiddleware,
    updateChargingBay
);

router.delete(
    "/:id",
    authMiddleware,
    deleteChargingBay
);

export default router;