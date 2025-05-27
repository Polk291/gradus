// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Ruta para registrar usuario
router.post("/register", authController.registrarUsuario);

// Ruta para login usuario
router.post("/login", authController.loginUsuario);

// Ruta para enviar/reenviar código de verificación por email
router.post("/send-verification-code", authController.enviarCodigoVerificacion);

// Ruta para verificar código enviado por email
router.post("/verify-email-code", authController.verificarCodigoEmail);

module.exports = router;
