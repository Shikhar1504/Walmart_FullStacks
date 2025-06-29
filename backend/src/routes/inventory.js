const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

// Public
router.get('/', inventoryController.getInventory);
router.get('/with-products', inventoryController.getInventoryWithProducts);
router.get('/dashboard', inventoryController.getInventoryDashboard);
router.get('/suppliers', inventoryController.getSuppliers);

// Admin
router.post('/', authenticateJWT, authorizeRoles('admin'), inventoryController.createInventoryItem);
router.post('/with-product', authenticateJWT, authorizeRoles('admin'), inventoryController.createInventoryWithProduct);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), inventoryController.updateInventoryItem);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), inventoryController.deleteInventoryItem);
router.get('/low-stock', authenticateJWT, authorizeRoles('admin'), inventoryController.getLowStockItems);
router.get('/out-of-stock', authenticateJWT, authorizeRoles('admin'), inventoryController.getOutOfStockItems);
router.get('/expired', authenticateJWT, authorizeRoles('admin'), inventoryController.getExpiredItems);

module.exports = router; 