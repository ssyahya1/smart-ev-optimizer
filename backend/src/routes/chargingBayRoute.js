import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

import {
    registerChargingBay,
    getChargingBays,
    getChargingBayById,
    updateChargingBay,
    deleteChargingBay
} from "../controllers/chargingBayController.js";

const router = express.Router();


router.use(authMiddleware);


router.get("/", getChargingBays);

router.get("/:id", getChargingBayById);


router.post("/", adminMiddleware, registerChargingBay);

router.put("/:id", adminMiddleware, updateChargingBay);

router.delete("/:id", adminMiddleware, deleteChargingBay);

export default router;
