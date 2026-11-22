const router = require("express").Router();
const { authenticate } = require("../middleware/authMiddleware");
const controller = require("../controllers/notificationController");

router.use(authenticate);
router.get("/", controller.list);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", controller.markRead);

module.exports = router;
