const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 0 },
  location: { type: String, default: 'Warehouse A' },
  minStockLevel: { type: Number, default: 10 },
  maxStockLevel: { type: Number, default: 100 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName: { type: String },
  batchNumber: { type: String }, // For tracking specific batches
  expiryDate: { type: Date }, // Expiry date for this inventory batch
  purchaseDate: { type: Date, default: Date.now }, // When this batch was purchased
  purchasePrice: { type: Number }, // Cost price for this batch
  lastUpdated: { type: Date, default: Date.now },
  alerts: [{ type: String }],
  status: { 
    type: String, 
    enum: ['active', 'expired', 'recalled', 'damaged'], 
    default: 'active' 
  },
  notes: { type: String }, // Additional notes about this inventory item
  createdAt: { type: Date, default: Date.now }
});

// Update lastUpdated before saving
inventorySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Add alert for low stock
inventorySchema.pre('save', function(next) {
  if (this.quantity <= this.minStockLevel && this.quantity > 0) {
    if (!this.alerts.includes('Low stock alert')) {
      this.alerts.push('Low stock alert');
    }
  } else {
    this.alerts = this.alerts.filter(alert => alert !== 'Low stock alert');
  }
  
  // Add alert for expired items
  if (this.expiryDate && new Date() > this.expiryDate) {
    if (!this.alerts.includes('Item expired')) {
      this.alerts.push('Item expired');
    }
    this.status = 'expired';
  }
  
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema); 