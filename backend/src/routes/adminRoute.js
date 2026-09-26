import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Admin access granted",
        user: req.user
    });
});

export default router;