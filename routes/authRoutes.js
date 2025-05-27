const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { validarCampos, validarJWT } = require("../middleware/Validaciones");

// Registro de usuario con validaciones
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

// Login de usuario con validaciones
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

// Enviar/re-enviar código de verificación con validación de email
router.post(
  "/send-verification-code",
  [body("email").isEmail().withMessage("Email inválido"), validarCampos],
  authController.enviarCodigoVerificacion
);

// Verificar código enviado por email con validaciones
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

// Ruta protegida que devuelve info del usuario autenticado
router.get("/perfil", validarJWT, async (req, res) => {
  try {
    // Puedes buscar el usuario en la DB para retornar más info si quieres
    const usuario = await authController.obtenerUsuarioPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json({ usuario });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

module.exports = router;
