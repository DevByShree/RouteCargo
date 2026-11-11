import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireDriver from "../middleware/requireDriver.js";
import { handleValidation } from "../middleware/validate.js";
import { listCapacity, createCapacity, deleteCapacity, capacityValidation } from "../controllers/capacityController.js";

const router = Router();
router.use(authMiddleware, requireDriver);

router.get("/", listCapacity);

router.post("/", capacityValidation, handleValidation, createCapacity);

router.delete("/:id", deleteCapacity);

export default router;
