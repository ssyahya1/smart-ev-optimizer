import express from "express";
import { registerUser,loginUser,refreshAccessToken,logoutUser,createAdmin} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { loginLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",loginLimiter, loginUser);
router.post("/refresh", refreshAccessToken);
router.get("/me", authMiddleware, (req, res) => {
    res.json({
        id: req.user.id,
        role: req.user.role
    });
});
router.post("/logout",logoutUser);
router.post("/admin", authMiddleware, authorizeRoles("admin"), createAdmin);
router.get(
    "/admin-test",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res) => {
        res.json({
            message: "Welcome admin"
        });
    }
);

export default router;