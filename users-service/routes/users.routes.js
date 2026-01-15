const express = require('express');
const router = express.Router();


// Controller functions
const auth_controller = require('../controllers/auth.controller.js');
const user_controller = require('../controllers/users.controller.js');

router.get("/users", auth_controller.authenticateToken, auth_controller.authorizeRole("admin"), user_controller.getAllUsers);
router.get("/users/:id", auth_controller.authenticateToken, user_controller.getUserById);

router.post("/register", user_controller.register);
router.post("/login", user_controller.login);

router.put("/users/:id", auth_controller.authenticateToken, user_controller.updateInfo);

router.delete("/users/:id", auth_controller.authenticateToken, user_controller.deleteUser);

module.exports = router;