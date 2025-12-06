import mongoose, { Document, Schema } from 'mongoose';

export interface IImage {
  _id?: string;
  url: string;
  public_id: string | null;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  isPromotionActive: boolean;
  images: IImage[];
  mainImageUrl?: string;
  stockQuantity: number;
  isActive: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    promotionalPrice: {
      type: Number,
      min: 0,
    },
    isPromotionActive: { type: Boolean, default: false },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: null },
      },
    ],
    mainImageUrl: { type: String },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

productSchema.pre('save', function (next) {
  if (this.isModified('images') && this.images.length > 0) {
    this.mainImageUrl = this.images[0].url;
  }
  next();
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
