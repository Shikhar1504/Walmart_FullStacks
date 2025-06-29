const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.get('/', supplierController.getSuppliers);
router.get('/dashboard', supplierController.getSupplierDashboard);
router.get('/performance/:id', supplierController.getSupplierPerformance);

// Development route for seeding sample data
router.post('/seed', supplierController.seedSampleData);

// Admin only routes
router.post('/', authenticateJWT, authorizeRoles('admin'), supplierController.createSupplier);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), supplierController.updateSupplier);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), supplierController.deleteSupplier);
router.get('/performance', authenticateJWT, authorizeRoles('admin'), supplierController.getPerformance);
router.get('/alerts', authenticateJWT, authorizeRoles('admin'), supplierController.getAlerts);

module.exports = router; 