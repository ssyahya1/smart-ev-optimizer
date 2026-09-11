import express from "express";

import {
    runRouting
} from "../controllers/routingController.js";

import {
    authMiddleware
} from "../middleware/authMiddleware.js";


const router = express.Router();


router.post(
    "/",
    authMiddleware,
    runRouting
);


export default router;