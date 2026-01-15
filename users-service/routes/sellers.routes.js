const express = require('express');
const router = express.Router();


// Controller functions
const auth_controller = require('../controllers/auth.controller.js');
const seller_controller = require('../controllers/sellers.controller.js');

router.get("/:id", seller_controller.getSellerById);

// router.get("/:id", auth_controller.authenticateToken, seller_controller.getSellerById);

router.post("/", seller_controller.createSeller);

router.put("/:id", auth_controller.authenticateToken, seller_controller.editSeller);

router.delete("/:id", auth_controller.authenticateToken, seller_controller.deleteSeller);

module.exports = router;