import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentMethod extends Document {
  name: string;
  identifier: string;
  description?: string;
  isEnabled: boolean;
  iconUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    name: { type: String, required: true, trim: true }, // Ex: "PIX", "Cartão de Crédito"
    identifier: { type: String, required: true, unique: true, trim: true }, // Ex: "pix", "credit_card"
    description: { type: String, trim: true },
    isEnabled: { type: Boolean, default: true, index: true },
    iconUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

const PaymentMethod = mongoose.model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
