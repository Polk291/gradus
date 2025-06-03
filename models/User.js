const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "El email no es válido"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    rol: {
      type: String,
      enum: ["usuario", "admin"],
      default: "usuario",
    },

    // Validación de email
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    // Recuperación de contraseña
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    // Código de recuperación por email
    codigoRecuperacion: {
      type: String,
      default: null,
    },
    expiraCodigoRecuperacion: {
      type: Date,
      default: null,
    },

    // Perfil académico
    perfilAcademico: {
      nivelAcademico: {
        type: String,
        trim: true,
        default: "",
      },
      universidad: {
        type: String,
        trim: true,
        default: "",
      },
      carrera: {
        type: String,
        trim: true,
        default: "",
      },
      tipoProyecto: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para hashear la contraseña
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Comparar contraseña
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generar código de verificación de email
userSchema.methods.generateEmailVerificationCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationCode = code;
  this.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000);
  this.emailVerified = false;
  return code;
};

// Verificar código de email
userSchema.methods.verifyEmailCode = async function (code) {
  if (
    this.emailVerificationCode === code &&
    this.emailVerificationExpires &&
    this.emailVerificationExpires > Date.now()
  ) {
    this.emailVerified = true;
    this.emailVerificationCode = null;
    this.emailVerificationExpires = null;
    await this.save();
    return true;
  }
  return false;
};

// Generar token de recuperación de contraseña
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
  return token;
};

// Generar código para recuperación (por email)
userSchema.methods.generateCodigoRecuperacion = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.codigoRecuperacion = code;
  this.expiraCodigoRecuperacion = new Date(Date.now() + 30 * 60 * 1000);
  return code;
};

// Verificar código de recuperación
userSchema.methods.verificarCodigoRecuperacion = async function (code) {
  if (
    this.codigoRecuperacion === code &&
    this.expiraCodigoRecuperacion &&
    this.expiraCodigoRecuperacion > Date.now()
  ) {
    this.codigoRecuperacion = null;
    this.expiraCodigoRecuperacion = null;
    await this.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model("Usuario", userSchema);
