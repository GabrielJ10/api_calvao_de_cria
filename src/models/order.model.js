const mongoose = require('mongoose');

// Schema para a cópia do endereço de entrega, garantindo a imutabilidade do pedido.
const shippingAddressSchema = new mongoose.Schema(
  {
    recipientName: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    complement: { type: String },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    cep: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

// Schema para a cópia de cada item, garantindo a imutabilidade do pedido.
const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    mainImageUrl: { type: String },
    quantity: { type: Number, required: true },
    priceAtTimeOfPurchase: { type: Number, required: true },
    totalItemPrice: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['AWAITING_PAYMENT', 'PAID', 'PREPARING_SHIPMENT', 'SHIPPED', 'DELIVERED', 'CANCELED'],
      default: 'AWAITING_PAYMENT',
      index: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    totals: {
      subtotal: { type: Number, required: true },
      itemsDiscount: { type: Number, required: true },
      couponDiscount: { type: Number, required: true },
      totalDiscount: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    payment: {
      method: { type: String, required: true },
      transactionId: { type: String },
      qrCode: { type: String },
      qrCodeImageUrl: { type: String },
    },
    shippingInfo: {
      carrier: { type: String },
      trackingCode: { type: String },
      estimatedDeliveryDate: { type: Date },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;