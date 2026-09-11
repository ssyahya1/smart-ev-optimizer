import express from "express";

import {
    runPowerAllocation
} from "../controllers/powerController.js";

import {
    authMiddleware
} from "../middleware/authMiddleware.js";


const router = express.Router();


router.post(
    "/",
    authMiddleware,
    runPowerAllocation
);


export default router;