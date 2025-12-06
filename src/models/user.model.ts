import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  cpf: string;
  passwordHash: string;
  birthDate?: Date;
  phone: string;
  role: 'customer' | 'admin';
  currentRefreshTokenHash?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
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
  }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
