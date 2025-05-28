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
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verificación de Email - Gradus</title>
</head>
<body style="margin:0; padding:0; background-color:#f8f5f1; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#11696B;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8f5f1; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="420" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff; border-radius:12px; box-shadow: 0 8px 24px rgba(17,105,107,0.2); overflow:hidden;">
          <tr>
            <td style="background-color:#11696B; padding: 40px 0; text-align: center;">
              <img 
                src="https://res.cloudinary.com/dyekkggot/image/upload/v1748405749/logo_drorqm.png" 
                alt="Logo Gradus" 
                width="140" 
                style="display: block; margin: 0 auto 15px auto; object-fit: contain;"
              />
              <h1 style="color:#f8f5f1; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 1px;">
                Verificación de Email
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 60px 40px; text-align: center;">
              <p style="font-size: 20px; margin: 0 0 12px 0; font-weight: 600;">
                ¡Hola!
              </p>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                Usa el siguiente código para verificar tu correo electrónico en <strong>Gradus</strong>:
              </p>
              <div style="
                display: inline-block;
                background: linear-gradient(135deg, #11696B, #1ea39a);
                padding: 20px 50px;
                font-size: 32px;
                font-weight: 800;
                color: #f8f5f1;
                border-radius: 12px;
                letter-spacing: 10px;
                box-shadow: 0 4px 12px rgba(17,105,107,0.4);
                user-select: none;
                font-family: 'Courier New', Courier, monospace;
              ">
                ${codigo}
              </div>
              <p style="margin-top: 40px; font-size: 14px; color: #666; max-width: 320px; margin-left: auto; margin-right: auto;">
                Este código expirará en 30 minutos.<br/>
                Si no solicitaste este correo, puedes ignorarlo.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #999;">
              © 2025 Gradus. Todos los derechos reservados.
            </td>
          </tr>
        </table>
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
