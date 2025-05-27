const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// Middleware para validar campos según express-validator
const validarCampos = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errores: errors.array().map((err) => err.msg),
    });
  }
  next();
};

// Middleware para validar JWT (protege rutas)
const validarJWT = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ mensaje: "No hay token, autorización denegada" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // info del token, p.ej: id, email, rol
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token no válido" });
  }
};

module.exports = {
  validarCampos,
  validarJWT,
};
