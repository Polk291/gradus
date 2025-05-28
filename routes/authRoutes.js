const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const authController = require("../controllers/authController");
const { validarCampos, validarJWT } = require("../middleware/Validaciones");

// Registro de usuario (genera y envía código de verificación)
router.post(
  "/register",
  [
    body("nombre")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    validarCampos,
  ],
  authController.registrarUsuario
);

// Login de usuario
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    validarCampos,
  ],
  authController.loginUsuario
);

router.post(
  "/verification-code",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("forceResend")
      .optional()
      .customSanitizer((value) => {
        // Convertimos a booleano, acepta true/false string o boolean
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
          return value.toLowerCase() === "true";
        }
        return false; // Si no es ninguno, lo ponemos en false
      }),
    validarCampos,
  ],
  authController.enviarOCodigoVerificacion
);
// Verificar código enviado por email
router.post(
  "/verify-email-code",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("codigo")
      .isLength({ min: 6, max: 6 })
      .withMessage("El código debe tener 6 dígitos"),
    validarCampos,
  ],
  authController.verificarCodigoEmail
);

// Ruta protegida para obtener perfil del usuario autenticado
router.get("/perfil", validarJWT, authController.obtenerUsuario);

module.exports = router;
