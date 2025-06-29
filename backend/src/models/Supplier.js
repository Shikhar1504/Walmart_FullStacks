const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  onTimeDelivery: { type: Number, default: 0 },
  qualityFailures: { type: Number, default: 0 },
  contractCompliance: { type: Number, default: 0 },
  reliabilityScore: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  failedInspections: { type: Number, default: 0 },
  alerts: [{ type: String }]
}, { _id: false });

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String },
  email: { type: String },
  phone: { type: String },
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'suspended'] },
  rating: { type: Number, default: 0 },
  lastOrder: { type: Date },
  performance: { type: performanceSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplier', supplierSchema); 