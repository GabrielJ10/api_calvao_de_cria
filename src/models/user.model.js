const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O nome é obrigatório.'],
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    cpf: {
      type: String,
      required: [true, 'O CPF é obrigatório.'],
      unique: true,
    },
    passwordHash: { type: String, required: true, select: false },
    birthDate: { type: Date },
    phone: { type: String, required: [true, 'O telefone é obrigatório.'] },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      select: false,
    },
    currentRefreshTokenHash: { type: String, select: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        const formattedBirthDate = ret.birthDate
          ? ret.birthDate.toISOString().split('T')[0]
          : ret.birthDate;

        const orderedResponse = {
          userId: ret._id,
          name: ret.name,
          email: ret.email,
          cpf: ret.cpf,
          birthDate: formattedBirthDate,
          phone: ret.phone,
          createdAt: ret.createdAt,
          updatedAt: ret.updatedAt,
        };

        // 2. Retorna o novo objeto ordenado
        return orderedResponse;
      },
    },
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
