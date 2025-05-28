require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Importar rutas
const authRoutes = require("./routes/authRoutes");

const app = express();

// const allowedOrigin = "https://gradushub.com";

app.use(
  cors()
  //   {
  //   origin: allowedOrigin,
  //   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  //   allowedHeaders: ["Content-Type", "Authorization"],
  // }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  res.send("API funcionando correctamente");
});

// Usar rutas
app.use("/api/v1/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en PUERTO: ${PORT}`);

  // Cada 4 segundos, hacer petición GET a la URL externa
  //   setInterval(async () => {
  //     try {
  //       const response = await fetch("https://backend-gradus-n2nm.onrender.com");
  //       if (response.ok) {
  //         console.log("Ping exitoso");
  //       } else {
  //         console.log("Ping falló con status:", response.status);
  //       }
  //     } catch (error) {
  //       console.error("Error haciendo ping", error.message);
  //     }
  //   }, 4000);
  // });
});
