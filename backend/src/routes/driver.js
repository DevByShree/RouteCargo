import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireDriver from "../middleware/requireDriver.js";
import { body } from "express-validator";
import { getProfile, updateProfile, profileValidation } from "../controllers/driverController.js";
import { handleValidation } from "../middleware/validate.js";

const router = Router();
router.use(authMiddleware, requireDriver);
router.get("/profile", getProfile);
router.put("/profile", profileValidation, handleValidation, updateProfile);
export default router;
