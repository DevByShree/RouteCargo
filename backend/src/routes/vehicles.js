import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireDriver from "../middleware/requireDriver.js";
import { handleValidation } from "../middleware/validate.js";
import { vehicleUpload } from "../middleware/uploadMiddleware.js";
import {
  listVehicles, createVehicle, updateVehicle, deleteVehicle, removeVehicleFile, vehicleValidation
} from "../controllers/vehicleController.js";

const router = Router();
router.use(authMiddleware, requireDriver);
router.get("/", listVehicles);
router.post("/", vehicleUpload, vehicleValidation, handleValidation, createVehicle);
router.put("/:id", vehicleUpload, vehicleValidation, handleValidation, updateVehicle);
router.delete("/:id", deleteVehicle);
router.delete("/:id/files/:fileId", removeVehicleFile);
export default router;
