
import express from "express";

import { runAssignment } from "../controllers/assignmentController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    runAssignment
);


export default router;
