import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { adminSensitiveLimiter } from "../middleware/rateLimitMiddleware.js";
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateUserRole,
  deleteAdminUser,
  getAdminVehicles,
  getAdminVehicleById,
  updateAdminVehicle,
  deleteAdminVehicle,
  getAdminChargingSessions,
  getAdminChargingSessionById,
  updateAdminChargingSession,
  deleteAdminChargingSession,
  getAdminChargingBays,
  getAdminChargingBayById,
  createAdminChargingBay,
  updateAdminChargingBay,
  deleteAdminChargingBay,
  getAdminGridSlots,
  getAdminGridSlotById,
  createAdminGridSlot,
  updateAdminGridSlot,
  deleteAdminGridSlot,
  getAdminSystem,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/dashboard", getAdminDashboard);
router.get("/system", getAdminSystem);

router.get("/users", getAdminUsers);
router.get("/users/:id", getAdminUserById);
router.post("/users", createAdminUser);
router.patch("/users/:id/role", adminSensitiveLimiter, updateUserRole);
router.delete("/users/:id", adminSensitiveLimiter, deleteAdminUser);

router.get("/vehicles", getAdminVehicles);
router.get("/vehicles/:id", getAdminVehicleById);
router.patch("/vehicles/:id", updateAdminVehicle);
router.delete("/vehicles/:id", deleteAdminVehicle);

router.get("/charging-sessions", getAdminChargingSessions);
router.get("/charging-sessions/:id", getAdminChargingSessionById);
router.patch("/charging-sessions/:id", updateAdminChargingSession);
router.delete("/charging-sessions/:id", deleteAdminChargingSession);

router.get("/charging-bays", getAdminChargingBays);
router.get("/charging-bays/:id", getAdminChargingBayById);
router.post("/charging-bays", createAdminChargingBay);
router.patch("/charging-bays/:id", updateAdminChargingBay);
router.delete("/charging-bays/:id", deleteAdminChargingBay);

router.get("/grid-slots", getAdminGridSlots);
router.get("/grid-slots/:id", getAdminGridSlotById);
router.post("/grid-slots", createAdminGridSlot);
router.patch("/grid-slots/:id", updateAdminGridSlot);
router.delete("/grid-slots/:id", deleteAdminGridSlot);

export default router;