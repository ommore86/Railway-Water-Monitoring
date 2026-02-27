const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// login
router.post("/login", authController.login);

// register (temporary)
router.post("/register", authController.register);

// forgot password
router.post("/forgot-password", authController.forgotPassword);

// reset password
router.post("/reset-password", authController.resetPassword);

module.exports = router;