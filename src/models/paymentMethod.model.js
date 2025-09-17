const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // Ex: "PIX", "Cartão de Crédito"
    identifier: { type: String, required: true, unique: true, trim: true }, // Ex: "pix", "credit_card"
    description: { type: String, trim: true },
    isEnabled: { type: Boolean, default: true, index: true },
    iconUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
module.exports = PaymentMethod;