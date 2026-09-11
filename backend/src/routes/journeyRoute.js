import express from "express";

import {
    runJourneyOptimization
} from "../controllers/journeyController.js";

import {
    authMiddleware
} from "../middleware/authMiddleware.js";


const router = express.Router();


router.post(
    "/",
    authMiddleware,
    runJourneyOptimization
);


export default router;