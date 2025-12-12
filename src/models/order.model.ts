import mongoose, { Document, Schema, Types } from 'mongoose';
import { OrderStatus } from '../enums/order.enum';

interface IShippingAddress {
  recipientName: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  phone: string;
}

interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  mainImageUrl?: string;
  quantity: number;
  priceAtTimeOfPurchase: number;
  totalItemPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  status: OrderStatus;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  totals: {
    subtotal: number;
    itemsDiscount: number;
    couponDiscount: number;
    totalDiscount: number;
    total: number;
  };
  payment: {
    method: string;
    transactionId?: string;
    qrCode?: string;
    qrCodeImageUrl?: string;
  };
  shippingInfo?: {
    carrier?: string;
    trackingCode?: string;
    estimatedDeliveryDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema para a cópia do endereço de entrega, garantindo a imutabilidade do pedido.
const shippingAddressSchema = new Schema<IShippingAddress>(
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
const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    mainImageUrl: { type: String },
    quantity: { type: Number, required: true },
    priceAtTimeOfPurchase: { type: Number, required: true },
    totalItemPrice: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.AWAITING_PAYMENT,
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

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
