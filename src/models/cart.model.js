const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    mainImageUrl: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    promotionalPrice: { type: Number },
    unitPrice: { type: Number, required: true },
    totalItemPrice: { type: Number, required: true },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      unique: true,
      sparse: true, // Permite múltiplos documentos com userId nulo
    },
    guestCartId: {
      type: String,
      index: true,
      unique: true,
      sparse: true, // Permite múltiplos documentos com guestCartId nulo
    },
    items: [cartItemSchema],
    totalItems: { type: Number, default: 0 },
    cartTotalPrice: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;