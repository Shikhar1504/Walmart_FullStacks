const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema(
  {
    price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    reason: { type: String }, // Reason for price change (ML optimization, manual, etc.)
    mlScore: { type: Number }, // ML confidence score for this price change
  },
  { _id: false }
);

const optimizationSchema = new mongoose.Schema(
  {
    wasteReduction: { type: Number, default: 0 },
    clearanceRate: { type: Number, default: 0 },
    revenueSaved: { type: Number, default: 0 },
    lastOptimization: { type: Date, default: Date.now },
  },
  { _id: false }
);

const priceFactorsSchema = new mongoose.Schema(
  {
    expirationUrgency: { type: Number, default: 0 },
    stockLevel: { type: Number, default: 0 },
    timeOfDay: { type: Number, default: 0 },
    demandForecast: { type: Number, default: 0 },
    competitorPrice: { type: Number, default: 0 },
    seasonality: { type: Number, default: 0 },
    marketTrend: { type: Number, default: 0 },
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema({
  //   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  //   supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  productId: { type: String, required: true, unique: true },
  supplierId: { type: String, required: true },
  supplierName: { type: String, required: true },

  // Basic pricing information
  currentPrice: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  cost: { type: Number, required: true },
  margin: { type: Number, required: true },
  suggestedPrice: { type: Number },
  suggestedMargin: { type: Number },

  // Inventory and stock information
  stock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 100 },
  minStockLevel: { type: Number, default: 10 },

  // Product details
  name: { type: String, required: true },
  sku: { type: String, required: true },
  category: { type: String, required: true },

  // Expiry information (for perishable items)
  expirationDate: { type: Date },
  daysUntilExpiry: { type: Number },
  isPerishable: { type: Boolean, default: false },

  // Demand and performance metrics
  demand: { type: Number, default: 0 },
  clearanceRate: { type: Number, default: 0 },
  wasteReduction: { type: Number, default: 0 },
  mlScore: { type: Number, default: 0 },

  // ML and optimization data
  priceFactors: { type: priceFactorsSchema, default: () => ({}) },
  optimization: { type: optimizationSchema, default: () => ({}) },

  // Status and tracking
  status: {
    type: String,
    enum: [
      "stable",
      "optimal",
      "expiring_soon",
      "critical",
      "low_stock",
      "out_of_stock",
      "active",
    ],
    default: "stable",
  },
  priceChange: { type: String, default: "0%" },
  lastUpdated: { type: Date, default: Date.now },

  // History and tracking
  history: [priceHistorySchema],
  mlPerformance: { type: Object },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to calculate derived fields
pricingSchema.pre("save", function (next) {
  // Calculate margin
  if (this.currentPrice && this.cost) {
    this.margin =
      Math.round(
        ((this.currentPrice - this.cost) / this.currentPrice) * 100 * 10
      ) / 10;
  }

  // Calculate days until expiry
  if (this.expirationDate) {
    const now = new Date();
    const expiry = new Date(this.expirationDate);
    this.daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    // Update status based on expiry
    if (this.daysUntilExpiry <= 0) {
      this.status = "critical";
    } else if (this.daysUntilExpiry <= 3) {
      this.status = "expiring_soon";
    }
  }

  // Update status based on stock levels
  if (this.stock === 0) {
    this.status = "out_of_stock";
  } else if (this.stock <= this.minStockLevel) {
    this.status = "low_stock";
  }

  // Calculate price change percentage
  if (this.originalPrice && this.currentPrice) {
    const change =
      ((this.currentPrice - this.originalPrice) / this.originalPrice) * 100;
    this.priceChange = `${change >= 0 ? "+" : ""}${
      Math.round(change * 10) / 10
    }%`;
  }

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Pricing", pricingSchema);
