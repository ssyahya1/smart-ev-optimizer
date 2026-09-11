import express from "express";

import {
    runBenchmark
} from "../controllers/benchmarkController.js";

import {
    authMiddleware
} from "../middleware/authMiddleware.js";


const router = express.Router();


router.post(
    "/",
    authMiddleware,
    runBenchmark
);


export default router;