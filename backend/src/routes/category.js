const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

// Public
router.get('/', categoryController.getCategories);

// Development route for seeding sample data
router.post('/seed', categoryController.seedSampleData);

// Admin
router.post('/', authenticateJWT, authorizeRoles('admin'), categoryController.createCategory);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), categoryController.updateCategory);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router; 