
import express from "express";

import {
    runScheduling
} from "../controllers/schedulingController.js";

import {
    authMiddleware
} from "../middleware/authMiddleware.js";


const router = express.Router();



router.post(
    "/",
    authMiddleware,
    runScheduling
);


export default router;