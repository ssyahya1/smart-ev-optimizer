import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

import {
    createGridSlot,
    getGridSlots,
    getGridSlotById,
    updateGridSlot,
    deleteGridSlot
} from "../controllers/gridSlotController.js";

const router = express.Router();


router.use(authMiddleware);


router.get("/", getGridSlots);
router.get("/:id", getGridSlotById);


router.post("/", adminMiddleware, createGridSlot);
router.put("/:id", adminMiddleware, updateGridSlot);
router.delete("/:id", adminMiddleware, deleteGridSlot);

export default router;
