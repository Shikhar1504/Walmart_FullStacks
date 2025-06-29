const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

console.log('🔧 Product routes being registered...');

// Test route to verify router is working
router.get('/test', (req, res) => {
  console.log('✅ Test route hit');
  res.json({ message: 'Product router is working' });
});

// Comment/review endpoints - moved to top for testing
router.get('/:id/comments', (req, res, next) => {
  console.log('🔍 Comments GET route hit with id:', req.params.id);
  productController.getComments(req, res, next);
});

router.post('/:id/comments', (req, res, next) => {
  console.log('🔍 Comments POST route hit with id:', req.params.id);
  authenticateJWT(req, res, (err) => {
    if (err) return next(err);
    productController.addComment(req, res, next);
  });
});

// Public endpoints - more specific routes first
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:category', productController.getProductsByCategory);

// Development route for seeding sample data
router.post('/seed', productController.seedSampleData);

// Admin endpoints
router.get('/admin/all', authenticateJWT, authorizeRoles('admin'), productController.getAllProducts);
router.post('/', authenticateJWT, authorizeRoles('admin'), upload.single('image'), productController.createProduct);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), productController.deleteProduct);
router.patch('/:id/toggle-status', authenticateJWT, authorizeRoles('admin'), productController.toggleProductStatus);

// Parameterized routes last
router.get('/:id', productController.getProduct);

console.log('✅ Product routes registered successfully');

module.exports = router; 