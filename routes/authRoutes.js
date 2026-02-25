const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// public login
router.post("/login", authController.login);

// temporary public register (we will secure later)
router.post("/register", authController.register);

module.exports = router;