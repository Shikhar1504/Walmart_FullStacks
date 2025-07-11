const User = require('../models/User');

// List all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    // If no users found, provide mock data
    if (users.length === 0) {
      const mockUsers = [
        {
          _id: 'mock-user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          avatar: '/images/avatars/user1.jpg',
          phone: '+1-555-0101',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          isActive: true,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          _id: 'mock-user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'customer',
          avatar: '/images/avatars/user2.jpg',
          phone: '+1-555-0202',
          address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          },
          isActive: true,
          createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          _id: 'mock-user-3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'customer',
          avatar: '/images/avatars/user3.jpg',
          phone: '+1-555-0303',
          address: {
            street: '789 Pine St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          },
          isActive: true,
          createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          _id: 'mock-user-4',
          name: 'Alice Brown',
          email: 'alice@example.com',
          role: 'customer',
          avatar: '/images/avatars/user4.jpg',
          phone: '+1-555-0404',
          address: {
            street: '321 Elm St',
            city: 'Houston',
            state: 'TX',
            zipCode: '77001',
            country: 'USA'
          },
          isActive: true,
          createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          _id: 'mock-user-5',
          name: 'Charlie Wilson',
          email: 'charlie@example.com',
          role: 'customer',
          avatar: '/images/avatars/user5.jpg',
          phone: '+1-555-0505',
          address: {
            street: '654 Maple Dr',
            city: 'Phoenix',
            state: 'AZ',
            zipCode: '85001',
            country: 'USA'
          },
          isActive: true,
          createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      ];
      
      res.json(mockUsers);
    } else {
      res.json(users);
    }
  } catch (err) { next(err); }
};

// Get single user (admin or self)
exports.getUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// Update user (admin or self)
exports.updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const updates = { ...req.body };
    delete updates.password;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// Delete user (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

// Upload avatar (admin or self)
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Placeholder: integrate with Cloudinary/S3 here
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.params.id, { avatar: avatarUrl }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Avatar uploaded', avatar: avatarUrl, user });
  } catch (err) { next(err); }
}; 