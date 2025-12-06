"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Schema para a cópia do endereço de entrega, garantindo a imutabilidade do pedido.
const shippingAddressSchema = new mongoose_1.Schema({
    recipientName: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    complement: { type: String },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    cep: { type: String, required: true },
    phone: { type: String, required: true },
}, { _id: false });
// Schema para a cópia de cada item, garantindo a imutabilidade do pedido.
const orderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    mainImageUrl: { type: String },
    quantity: { type: Number, required: true },
    priceAtTimeOfPurchase: { type: Number, required: true },
    totalItemPrice: { type: Number, required: true },
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
}, { timestamps: true });
const Order = mongoose_1.default.model('Order', orderSchema);
exports.default = Order;
