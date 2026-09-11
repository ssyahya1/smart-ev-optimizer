import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
    registerVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
} from "../controllers/vehicleController.js";

const router = express.Router();

router.post(
    "/registervehicle",
    authMiddleware,
    registerVehicle
);

router.get(
    "/",
    authMiddleware,
    getVehicles
);

router.get(
    "/:id",
    authMiddleware,
    getVehicleById
);

router.put(
    "/:id",
    authMiddleware,
    updateVehicle
);

router.delete(
    "/:id",
    authMiddleware,
    deleteVehicle
);

export default router;