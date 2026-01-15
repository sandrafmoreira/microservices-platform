const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notifications.controller.js');
const {authenticateToken, authorizeRole} = require('../../users-service/controllers/auth.controller.js');

router.post("/", authenticateToken, notificationController.createNotification);

router.get("/", authenticateToken, notificationController.getAllNotifications);
router.get("/user/:userId", notificationController.getNotificationByUserId);
router.get("/:id", authenticateToken, notificationController.getNotificationById);

router.delete("/:id", authenticateToken, notificationController.deleteNotification);

module.exports = router;