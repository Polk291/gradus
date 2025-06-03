const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validarJWT = require("../middleware/Validaciones").validarJWT;

// Ruta para obtener el perfil académico (GET)
router.get(
  "/perfil-academico",
  validarJWT,
  authController.obtenerPerfilAcademico
);

// Ruta para actualizar el perfil académico (PUT)
router.put(
  "/perfil-academico",
  validarJWT,
  authController.actualizarPerfilAcademico
);

module.exports = router;
