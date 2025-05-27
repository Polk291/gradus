// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Ruta para registrar usuario
router.post("/register", authController.registrarUsuario);

// Ruta para login usuario
router.post("/login", authController.loginUsuario);

module.exports = router;
