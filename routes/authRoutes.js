const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const authController = require("../controllers/authController");
const { validarCampos, validarJWT } = require("../middleware/Validaciones");

// Registro de usuario
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

// Enviar o reenviar código de verificación de email
router.post(
  "/verification-code",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("forceResend")
      .optional()
      .customSanitizer((value) => {
        if (typeof value === "boolean") return value;
        if (typeof value === "string") return value.toLowerCase() === "true";
        return false;
      }),
    validarCampos,
  ],
  authController.enviarOCodigoVerificacion
);

// Verificar código de email
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

// 🔐 Ruta protegida para obtener perfil
router.get("/perfil", validarJWT, authController.obtenerUsuario);

// ✅ NUEVAS RUTAS PARA RECUPERACIÓN DE CONTRASEÑA

// Enviar o reenviar código de recuperación
router.post(
  "/password-recovery-code",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("forceResend")
      .optional()
      .customSanitizer((value) => {
        if (typeof value === "boolean") return value;
        if (typeof value === "string") return value.toLowerCase() === "true";
        return false;
      }),
    validarCampos,
  ],
  authController.enviarCodigoRecuperacion
);

// Verificar código de recuperación
router.post(
  "/verify-recovery-code",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("codigo")
      .isLength({ min: 6, max: 6 })
      .withMessage("El código debe tener 6 dígitos"),
    validarCampos,
  ],
  authController.verificarCodigoRecuperacion
);

// Restablecer contraseña
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("codigo")
      .isLength({ min: 6, max: 6 })
      .withMessage("El código debe tener 6 dígitos"),
    body("nuevaPassword")
      .isLength({ min: 6 })
      .withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
    validarCampos,
  ],
  authController.restablecerPassword
);

module.exports = router;
