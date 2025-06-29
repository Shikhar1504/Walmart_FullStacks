const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Apply authentication to all analytics routes
router.use(authenticateJWT);

// Dashboard metrics
router.get('/dashboard', analyticsController.getDashboard);

// Revenue metrics
router.get('/revenue', analyticsController.getRevenue);

// Historical revenue data for charts
router.get('/revenue-history', analyticsController.getRevenueHistory);

// Sales by category
router.get('/sales-by-category', analyticsController.getSalesByCategory);

// Supplier performance
router.get('/supplier-performance', analyticsController.getSupplierPerformance);

// Critical alerts
router.get('/critical-alerts', analyticsController.getCriticalAlerts);

// Demand forecast
router.get('/demand-forecast', analyticsController.getDemandForecast);

// Supplier risk
router.get('/supplier-risk', analyticsController.getSupplierRisk);

// Price optimization
router.get('/price-optimization', analyticsController.getPriceOptimization);

module.exports = router; 