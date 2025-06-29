const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  image: { type: String },
  description: { type: String },
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number, default: 0 },
  features: [{ type: String }],
  specifications: { type: Object },
  featured: { type: Boolean, default: false },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String },
  expiryDate: { type: Date },
  sku: { type: String, unique: true },
  barcode: { type: String },
  weight: { type: Number },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  isActive: { type: Boolean, default: true },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

productSchema.pre('save', function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.sku = `${this.category.substring(0, 3).toUpperCase()}-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema); 