import { Router } from "express";
import { body } from "express-validator";
import authMiddleware from "../middleware/authMiddleware.js";
import requireDriver from "../middleware/requireDriver.js";
import { handleValidation } from "../middleware/validate.js";
import { listRequests, updateRequestStatus } from "../controllers/requestController.js";

const router = Router();
router.use(authMiddleware, requireDriver);
router.get("/", listRequests);
router.patch("/:id/status", [body("status").isIn(["Accepted", "Rejected", "In Transit", "Completed"])], handleValidation, updateRequestStatus);
export default router;
