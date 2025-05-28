const Usuario = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Configura el transporter de nodemailer para Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // tu email Gmail desde .env
    pass: process.env.GMAIL_PASSWORD, // tu password o app password de Gmail desde .env
  },
});

// Crear token JWT
const crearToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Función real para enviar correo con el código de verificación y diseño moderno
const enviarEmailCodigo = async (email, codigo) => {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new Error("Email inválido o no proporcionado");
  }

  if (!codigo || typeof codigo !== "string" || codigo.length !== 6) {
    throw new Error("Código de verificación inválido");
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    throw new Error(
      "Credenciales de correo no configuradas en variables de entorno"
    );
  }

  if (!transporter || typeof transporter.sendMail !== "function") {
    throw new Error("Transporte de correo no configurado correctamente");
  }

  const emailHtml = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verificación de Email - Gradus</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
        }
        .code-box {
          padding: 15px 30px !important;
          font-size: 24px !important;
        }
      }
    </style>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f8f5f1;
      font-family: 'Poppins', Arial, sans-serif;
      color: #2d3748;
    "
  >
    <!-- Preheader text (visible en lista de correos) -->
    <div style="display: none; max-height: 0px; overflow: hidden">
      Completa tu registro en Gradus con este código de verificación: ${codigo}
    </div>

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="background-color: #f8f5f1; padding: 40px 10px"
    >
      <tr>
        <td align="center">
          <!-- Contenedor principal -->
          <table
            class="container"
            width="480"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="
              background-color: #ffffff;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(17, 105, 107, 0.1);
              overflow: hidden;
              border: 1px solid rgba(0, 0, 0, 0.05);
              margin-bottom: 20px;
            "
          >
            <!-- Header con gradiente basado en #f8f5f1 -->
            <tr>
              <td
                style="background: #f8f5f1; padding: 50px 0; text-align: center"
              >
                <img
                  src="https://res.cloudinary.com/dyekkggot/image/upload/v1748450535/logo-removebg-preview_mktana.png"
                  alt="Logo Gradus"
                  width="140"
                  style="
                    display: block;
                    margin: 0 auto 15px auto;
                    object-fit: contain;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
                    transition: all 0.3s ease;
                  "
                />
                <h1
                  style="
                    color: #2d3748;
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: 0.5px;
                  "
                >
                  Verifica tu correo electrónico
                </h1>
              </td>
            </tr>

            <!-- Contenido principal -->
            <tr>
              <td style="padding: 50px 40px; text-align: center">
                <!-- SVG moderno de verificación -->
                <div style="margin-bottom: 25px">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <!-- Círculo de fondo con gradiente -->
                    <circle
                      cx="40"
                      cy="40"
                      r="38"
                      fill="url(#gradient)"
                      stroke="#11696B"
                      stroke-width="2"
                    />

                    <!-- Marca de verificación más simple -->
                    <path
                      d="M25 40L35 50L55 30"
                      stroke="white"
                      stroke-width="4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />

                    <!-- Círculo exterior sutil -->
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="white"
                      stroke-width="1.5"
                      stroke-opacity="0.7"
                      fill="none"
                    />

                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#11696B" />
                        <stop offset="100%" stop-color="#1ea39a" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <p
                  style="
                    font-size: 18px;
                    margin: 0 0 15px 0;
                    font-weight: 500;
                    color: #4a5568;
                  "
                >
                  ¡Estás a un paso de comenzar con
                  <strong style="color: #11696b">Gradus</strong>!
                </p>

                <p
                  style="
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 0 0 30px 0;
                    color: #4a5568;
                  "
                >
                  Introduce este código en la aplicación para verificar tu
                  correo electrónico:
                </p>

                <div
                  class="code-box"
                  style="
                    display: inline-block;
                    background: linear-gradient(135deg, #11696b, #1ea39a);
                    padding: 20px 50px;
                    font-size: 32px;
                    font-weight: 700;
                    color: #ffffff;
                    border-radius: 12px;
                    letter-spacing: 8px;
                    box-shadow: 0 6px 16px rgba(17, 105, 107, 0.2);
                    user-select: text;
                    font-family: 'Courier New', Courier, monospace;
                    margin: 0 auto;
                    transition: all 0.3s ease;
                    cursor: text;
                  "
                >
                  ${codigo}
                </div>

                <!-- Tiempo de expiración con animación -->
                <div
                  style="
                    margin-top: 40px;
                    background-color: #f8f9fa;
                    padding: 12px;
                    border-radius: 8px;
                    display: inline-block;
                  "
                >
                  <p
                    style="
                      margin: 0;
                      font-size: 14px;
                      color: #718096;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    "
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style="margin-right: 8px"
                    >
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="#718096"
                        stroke-width="2"
                      />
                      <path
                        d="M12 6V12L16 14"
                        stroke="#718096"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                    Este código expirará en
                    <strong style="color: #11696b; margin-left: 4px"
                      >30 minutos</strong
                    >
                  </p>
                </div>

                <!-- Botón de acción alternativo -->
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="margin: 30px auto"
                >
                  <tr>
                    <td
                      style="
                        border-radius: 8px;
                        background: #11696b;
                        text-align: center;
                      "
                    >
                      <a
                        href="#"
                        style="
                          background: #11696b;
                          border: 1px solid #11696b;
                          border-radius: 8px;
                          color: #ffffff;
                          font-family: 'Poppins', sans-serif;
                          font-size: 15px;
                          font-weight: 500;
                          line-height: 1.5;
                          padding: 12px 24px;
                          text-decoration: none;
                          display: inline-block;
                          cursor: default;
                        "
                      >
                        Mantén presionado para copiar el código
                      </a>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin-top: 20px;
                    font-size: 14px;
                    color: #a0aec0;
                    max-width: 320px;
                    margin-left: auto;
                    margin-right: auto;
                  "
                >
                  Si no solicitaste este correo, puedes ignorarlo con toda
                  seguridad.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  background-color: #f0f2f5;
                  padding: 25px;
                  text-align: center;
                "
              >
                <p style="margin: 0; font-size: 12px; color: #718096">
                  © 2025 Gradus. Todos los derechos reservados.
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #718096">
                  <a href="#" style="color: #11696b; text-decoration: none"
                    >Política de privacidad</a
                  >
                  •
                  <a href="#" style="color: #11696b; text-decoration: none"
                    >Términos de servicio</a
                  >
                </p>
              </td>
            </tr>
          </table>

          <!-- Mensaje para clientes de correo que no soportan HTML -->
          <div style="display: none; max-height: 0px; overflow: hidden">
            Tu código de verificación para Gradus es: ${codigo} (Válido por 30
            minutos)
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>

`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Código de verificación de email - Gradus",
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.messageId);
  } catch (error) {
    console.error("Error enviando email:", error);
    throw new Error(`Error enviando email de verificación: ${error.message}`);
  }
};

// Registro de usuario (ahora genera y envía código de verificación)
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validación básica de datos
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Faltan datos requeridos" });
    }

    // Validar credenciales de email antes de crear usuario
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      return res.status(500).json({
        mensaje:
          "Error en servidor: Credenciales de correo no configuradas correctamente",
      });
    }

    // Verificar si usuario ya existe
    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({ nombre, email, password });

    // Generar código de verificación
    const codigo = nuevoUsuario.generateEmailVerificationCode();

    // Guardar usuario en BD
    await nuevoUsuario.save();

    // Intentar enviar email de verificación
    try {
      await enviarEmailCodigo(email, codigo);
    } catch (error) {
      // Si falla el envío, borrar usuario para rollback
      await Usuario.findByIdAndDelete(nuevoUsuario._id);
      console.error("Error enviando email, usuario eliminado:", error);
      return res.status(500).json({
        mensaje: "Error enviando email de verificación. Registro cancelado.",
      });
    }

    // Crear token JWT
    const token = crearToken(nuevoUsuario);

    // Responder éxito
    res.status(201).json({
      mensaje:
        "Usuario registrado exitosamente. Se envió código de verificación al email.",
      token,
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        emailVerified: nuevoUsuario.emailVerified,
      },
    });
  } catch (error) {
    console.error("Error en registrarUsuario:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Login de usuario
exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ mensaje: "Faltan datos requeridos" });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensaje: "Credenciales incorrectas" });
    }

    const esValida = await usuario.comparePassword(password);
    if (!esValida) {
      return res.status(400).json({ mensaje: "Credenciales incorrectas" });
    }

    if (!usuario.emailVerified) {
      return res.status(403).json({
        mensaje:
          "Email no verificado. Por favor, verifica tu email antes de iniciar sesión.",
      });
    }

    const token = crearToken(usuario);

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en loginUsuario:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Enviar/reenviar código de verificación al email
const resendLimiter = new Map();

exports.enviarOCodigoVerificacion = async (req, res) => {
  try {
    const { email, forceResend } = req.body;

    if (!email) {
      return res.status(400).json({ mensaje: "Email requerido" });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (usuario.emailVerified) {
      return res
        .status(400)
        .json({ mensaje: "El email ya está verificado previamente" });
    }

    const now = Date.now();
    const limitMs = 30 * 1000; // 30 segundos entre reenvíos

    if (forceResend) {
      // Si es reenvío forzado, aplicamos limitador para no abusar
      if (resendLimiter.has(email)) {
        const lastSent = resendLimiter.get(email);
        const diff = now - lastSent;

        if (diff < limitMs) {
          const retryAfter = Math.ceil((limitMs - diff) / 1000);
          return res.status(429).json({
            mensaje: `Espera ${retryAfter} segundos antes de reenviar el código.`,
            retryAfter,
          });
        }
      }
      // Generar nuevo código y enviar
      const codigo = usuario.generateEmailVerificationCode();
      await usuario.save();

      await enviarEmailCodigo(email, codigo);

      resendLimiter.set(email, now);

      return res.json({
        mensaje: "Nuevo código de verificación reenviado al email",
      });
    } else {
      // No es reenvío forzado, es envío inicial o normal
      if (
        usuario.emailVerificationCode &&
        usuario.emailVerificationExpires &&
        usuario.emailVerificationExpires > now
      ) {
        return res.status(400).json({
          mensaje:
            "Ya se ha enviado un código. Espera unos minutos antes de solicitar otro.",
        });
      }
      // Generar código y enviar
      const codigo = usuario.generateEmailVerificationCode();
      await usuario.save();

      await enviarEmailCodigo(email, codigo);

      return res.json({ mensaje: "Código de verificación enviado al email" });
    }
  } catch (error) {
    console.error("Error en enviarOCodigoVerificacion:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

exports.verificarCodigoEmail = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({ mensaje: "Email y código son requeridos" });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (usuario.emailVerified) {
      return res
        .status(400)
        .json({ mensaje: "El email ya está verificado previamente" });
    }

    const esValido = await usuario.verifyEmailCode(codigo);

    if (!esValido) {
      return res.status(400).json({ mensaje: "Código inválido o expirado" });
    }

    // Marcar el email como verificado y limpiar campos relacionados
    usuario.emailVerified = true;
    usuario.emailVerificationCode = undefined;
    usuario.emailVerificationExpires = undefined;
    await usuario.save();

    res.json({ mensaje: "Email verificado exitosamente" });
  } catch (error) {
    console.error("Error en verificarCodigoEmail:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};
// Obtener info del usuario autenticado
exports.obtenerUsuario = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ mensaje: "No autorizado" });
    }

    const usuario = await Usuario.findById(usuarioId).select(
      "-password -codigoVerificacion -__v"
    );
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({
      mensaje: "Usuario encontrado",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        emailVerified: usuario.emailVerified,
      },
    });
  } catch (error) {
    console.error("Error en obtenerUsuario:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};
