import Proyecto from "../models/Proyecto.js";

// Crear un nuevo proyecto o actualizar si ya existe por usuario y hash
export const crearOActualizarProyecto = async (req, res) => {
  try {
    const { contenidoDocumento, paginas, datosExtraidos, userId } = req.body;

    if (!contenidoDocumento || contenidoDocumento.trim().length < 30) {
      return res
        .status(400)
        .json({ error: "El contenido del documento es inválido" });
    }

    const hashDocumento = crypto
      .createHash("md5")
      .update(contenidoDocumento)
      .digest("hex");

    const datos = {
      usuario: userId,
      titulo: datosExtraidos.titulo || "",
      autor: datosExtraidos.autor || "",
      universidad: datosExtraidos.universidad || "",
      carrera: datosExtraidos.carrera || "",
      año: datosExtraidos.año || "",
      resumen: datosExtraidos.resumen || "",
      preguntas: datosExtraidos.preguntas || [],
      paginas: paginas || null,
      contenidoDocumento,
      hashDocumento,
    };

    // Actualizar si ya existe el proyecto con el mismo hash y usuario
    const proyecto = await Proyecto.findOneAndUpdate(
      { usuario: userId, hashDocumento },
      datos,
      { upsert: true, new: true }
    );

    res.status(200).json(proyecto);
  } catch (error) {
    console.error("[crearOActualizarProyecto]", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener todos los proyectos de un usuario
export const obtenerProyectosPorUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const proyectos = await Proyecto.find({ usuario: userId }).sort({
      creadoEn: -1,
    });

    res.status(200).json(proyectos);
  } catch (error) {
    console.error("[obtenerProyectosPorUsuario]", error);
    res.status(500).json({ error: "Error al obtener los proyectos" });
  }
};

// Obtener un solo proyecto por su ID
export const obtenerProyectoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    res.status(200).json(proyecto);
  } catch (error) {
    console.error("[obtenerProyectoPorId]", error);
    res.status(500).json({ error: "Error al obtener el proyecto" });
  }
};

// Eliminar un proyecto
export const eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Proyecto.findByIdAndDelete(id);

    if (!eliminado) {
      return res
        .status(404)
        .json({ error: "Proyecto no encontrado para eliminar" });
    }

    res.status(200).json({ mensaje: "Proyecto eliminado correctamente" });
  } catch (error) {
    console.error("[eliminarProyecto]", error);
    res.status(500).json({ error: "Error al eliminar el proyecto" });
  }
};
