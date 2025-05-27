const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Opciones recomendadas para evitar warnings y mejorar conexión

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB conectado correctamente");

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB desconectado. Intentando reconectar...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("♻️ MongoDB reconectado");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Error en la conexión con MongoDB:", err);
    });
  } catch (error) {
    console.error("❌ No se pudo conectar a MongoDB:", error);
    process.exit(1); // Salir del proceso si no hay conexión
  }
};

module.exports = connectDB;
