const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

// Create order (user)
router.post('/', authenticateJWT, orderController.createOrder);
// List orders (admin: all, user: own)
router.get('/', authenticateJWT, orderController.getOrders);
// Track order by tracking number (public) - MUST come before /:id route
router.get('/tracking/:trackingNumber', orderController.trackOrder);
// Get order by ID (admin: any, user: own)
router.get('/:id', authenticateJWT, orderController.getOrderById);
// Update order status (admin only)
router.put('/:id/status', authenticateJWT, authorizeRoles('admin'), orderController.updateOrderStatus);

module.exports = router; 