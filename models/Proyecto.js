import mongoose from "mongoose";

const ProyectoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    titulo: { type: String, required: true },
    autor: { type: String },
    universidad: { type: String },
    carrera: { type: String },
    año: { type: String },
    resumen: { type: String },
    preguntas: {
      type: [String], // Tres preguntas: fácil, intermedia, difícil
      validate: [(array) => array.length <= 3, "Máximo 3 preguntas permitidas"],
    },
    paginas: { type: Number }, // si se desea guardar también esto
    contenidoDocumento: { type: String, required: true },
    hashDocumento: { type: String, required: true, unique: true },
  },
  {
    timestamps: true, // crea automáticamente createdAt y updatedAt
  }
);

export default mongoose.models.Proyecto ||
  mongoose.model("Proyecto", ProyectoSchema);
