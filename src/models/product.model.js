const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
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
    images: { type: [String], default: [] },
    mainImageUrl: { type: String },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 0 },
  },

  {
    timestamps: true
  }
);

productSchema.pre('save', function (next) {
  if (this.isModified('images') && this.images.length > 0) {
    this.mainImageUrl = this.images[0];
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
