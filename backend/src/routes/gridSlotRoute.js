import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
    createGridSlot,
    getGridSlots,
    getGridSlotById,
    updateGridSlot,
    deleteGridSlot
} from "../controllers/gridSlotController.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    createGridSlot
);

router.get(
    "/",
    authMiddleware,
    getGridSlots
);

router.get(
    "/:id",
    authMiddleware,
    getGridSlotById
);

router.put(
    "/:id",
    authMiddleware,
    updateGridSlot
);

router.delete(
    "/:id",
    authMiddleware,
    deleteGridSlot
);

export default router;