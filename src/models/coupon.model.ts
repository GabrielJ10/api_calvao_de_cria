import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchaseValue: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed'], // Desconto percentual ou valor fixo
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchaseValue: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);

export default Coupon;
