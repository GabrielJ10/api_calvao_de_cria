import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAddress extends Document {
  userId: Types.ObjectId;
  alias: string;
  recipientName: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    alias: {
      type: String,
      required: [true, 'O apelido do endereço é obrigatório (ex: Casa, Trabalho).'],
      trim: true,
    },
    recipientName: {
      type: String,
      required: [true, 'O nome do destinatário é obrigatório.'],
      trim: true,
    },
    cep: {
      type: String,
      required: [true, 'O CEP é obrigatório.'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'O logradouro é obrigatório.'],
      trim: true,
    },
    number: {
      type: String,
      required: [true, 'O número é obrigatório.'],
      trim: true,
    },
    complement: {
      type: String,
      trim: true,
    },
    neighborhood: {
      type: String,
      required: [true, 'O bairro é obrigatório.'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'A cidade é obrigatória.'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'O estado é obrigatório.'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'O telefone de contato é obrigatório.'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Address = mongoose.model<IAddress>('Address', addressSchema);

export default Address;
