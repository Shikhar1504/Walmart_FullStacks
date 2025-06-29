const Category = require('../models/Category');

// Get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) { next(err); }
};

// Create category (admin only)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) return res.status(409).json({ message: 'Category already exists' });
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) { next(err); }
};

// Update category (admin only)
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) { next(err); }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) { next(err); }
};

// Seed sample category data (for development/testing)
exports.seedSampleData = async (req, res, next) => {
  try {
    // Check if categories already exist
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      return res.json({ message: 'Sample data already exists', count: existingCategories.length });
    }

    const sampleCategories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', description: 'Apparel and fashion items' },
      { name: 'Home', description: 'Home and garden products' },
      { name: 'Sports', description: 'Sports equipment and accessories' },
      { name: 'Books', description: 'Books and educational materials' },
      { name: 'Toys', description: 'Toys and games' },
      { name: 'Accessories', description: 'Various accessories and add-ons' }
    ];

    const createdCategories = await Category.insertMany(sampleCategories);
    res.status(201).json({ 
      message: 'Sample category data created successfully', 
      count: createdCategories.length 
    });
  } catch (err) { next(err); }
}; 