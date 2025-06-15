const express = require("express");
const router = express.Router();
const proyectoController = require("../controllers/proyectoController");
const { validarJWT } = require("../middleware/Validaciones");

// POST: Crear o actualizar un proyecto
router.post("/crear", validarJWT, proyectoController.crearOActualizarProyecto);

// GET: Obtener todos los proyectos del usuario autenticado
router.get(
  "/usuario/:userId",
  validarJWT,
  proyectoController.obtenerProyectosPorUsuario
);

// GET: Obtener un proyecto por su ID
router.get("/ver/:id", validarJWT, proyectoController.obtenerProyectoPorId);

// DELETE: Eliminar un proyecto por su ID
router.delete("/eliminar/:id", validarJWT, proyectoController.eliminarProyecto);

module.exports = router;
