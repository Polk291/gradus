const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
      minlength: 8, // aumentado para mayor seguridad
    },
    rol: {
      type: String,
      enum: ["usuario", "admin"],
      default: "usuario",
    },

    // NUEVOS CAMPOS PARA VALIDACIÓN EMAIL
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
  },
  {
    timestamps: true,
  }
);

// Middleware para hashear la contraseña antes de guardar
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

// Método para comparar contraseña ingresada con la almacenada
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Genera un código de verificación de 6 dígitos, lo guarda junto con
 * la fecha de expiración (30 minutos desde ahora) y marca emailVerified como false
 */
userSchema.methods.generateEmailVerificationCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos numéricos
  this.emailVerificationCode = code;
  this.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
  this.emailVerified = false;
  return code;
};

/**
 * Verifica que el código proporcionado coincida y no haya expirado.
 * Si es válido, marca el email como verificado y guarda el usuario.
 * @param {string} code - código de verificación
 * @returns {Promise<boolean>} true si es válido, false si no
 */
userSchema.methods.verifyEmailCode = async function (code) {
  if (
    this.emailVerificationCode === code &&
    this.emailVerificationExpires &&
    this.emailVerificationExpires > Date.now()
  ) {
    this.emailVerified = true;
    this.emailVerificationCode = null;
    this.emailVerificationExpires = null;
    await this.save(); // guardar cambios
    return true;
  }
  return false;
};

module.exports = mongoose.model("Usuario", userSchema);
