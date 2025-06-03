// routes/perfilAcademicoRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validarJWT } = require("../middleware/Validaciones");

// GET: Obtener perfil académico
router.get("/", validarJWT, authController.obtenerPerfilAcademico);

// PUT: Actualizar perfil académico
router.post("/", validarJWT, authController.actualizarPerfilAcademico);

module.exports = router;
