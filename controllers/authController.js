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

// Base64 de tu logo (reemplaza este string con el tuyo real)
const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."; // Pega aquí tu base64 real

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
  const emailHtml = `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8" /></head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding: 20px 10px;">
          <table width="400" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fff; border-radius:8px; box-shadow:0 4px 15px rgba(0,0,0,0.1); overflow:hidden;">
            <tr>
              <td style="background-color:#0052cc; padding: 30px; text-align: center;">
                <img 
                  src="${logoBase64}" 
                  alt="Logo Gradus" 
                  width="120" 
                  style="display: block; margin: 0 auto 15px auto; object-fit: contain;"
                />
                <h1 style="color:#ffffff; font-size: 24px; margin:0;">Verificación de Email</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; text-align: center;">
                <p style="font-size: 18px; margin-bottom: 20px;">
                  Hola,
                </p>
                <p style="font-size: 16px; margin-bottom: 30px;">
                  Usa el siguiente código para verificar tu correo electrónico en Gradus:
                </p>
                <div style="display: inline-block; padding: 15px 30px; font-size: 28px; font-weight: bold; letter-spacing: 6px; border-radius: 8px; background: linear-gradient(90deg, #0052cc, #003d99); color: #fff; user-select: none;">
                  ${codigo}
                </div>
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                  Este código expirará en 30 minutos.
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

  await transporter.sendMail(mailOptions);
};

// Registro de usuario (ahora genera y envía código de verificación)
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const existeUsuario = await Usuario.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    const nuevoUsuario = new Usuario({ nombre, email, password });

    const codigo = nuevoUsuario.generateEmailVerificationCode();
    await nuevoUsuario.save();

    await enviarEmailCodigo(email, codigo);

    const token = crearToken(nuevoUsuario);

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
exports.enviarCodigoVerificacion = async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (usuario.emailVerified) {
      return res
        .status(400)
        .json({ mensaje: "El email ya está verificado previamente" });
    }

    const codigo = usuario.generateEmailVerificationCode();
    await usuario.save();

    await enviarEmailCodigo(email, codigo);

    res.json({ mensaje: "Código de verificación enviado al email" });
  } catch (error) {
    console.error("Error en enviarCodigoVerificacion:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Verificar código enviado por email
exports.verificarCodigoEmail = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (usuario.emailVerified) {
      return res
        .status(400)
        .json({ mensaje: "El email ya está verificado previamente" });
    }

    const esValido = usuario.verifyEmailCode(codigo);

    if (!esValido) {
      return res.status(400).json({ mensaje: "Código inválido o expirado" });
    }

    await usuario.save();

    res.json({ mensaje: "Email verificado exitosamente" });
  } catch (error) {
    console.error("Error en verificarCodigoEmail:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};
