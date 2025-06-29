const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

// List all users (admin)
router.get('/', authenticateJWT, authorizeRoles('admin'), userController.getAllUsers);
// Get user (admin/self)
router.get('/:id', authenticateJWT, userController.getUser);
// Update user (admin/self)
router.put('/:id', authenticateJWT, userController.updateUser);
// Delete user (admin)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), userController.deleteUser);
// Upload avatar (admin/self)
router.post('/:id/avatar', authenticateJWT, upload.single('avatar'), userController.uploadAvatar);

module.exports = router; 