import express from "express";

import {
    runResourceAllocation
} from "../controllers/resourceAllocationController.js";

import {
    authMiddleware
} from "../middleware/authMiddleware.js";


const router = express.Router();


router.post(
    "/",
    authMiddleware,
    runResourceAllocation
);


export default router;