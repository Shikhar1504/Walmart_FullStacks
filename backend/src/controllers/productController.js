const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with search, filter, pagination (only active products for e-commerce)
exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', category } = req.query;
    const query = { isActive: true }; // Only show active products
    if (search) query.name = { $regex: search, $options: 'i' };
    
    // Handle category filtering - support both category ID and category name
    if (category) {
      // First, try to find the category by ID to get the name
      try {
        const categoryDoc = await Category.findById(category);
        if (categoryDoc) {
          // If category ID is valid, use the category name
          query.category = categoryDoc.name;
        } else {
          // If not found by ID, assume it's a category name
          query.category = category;
        }
      } catch (err) {
        // If category ID is invalid, assume it's a category name
        query.category = category;
      }
    }
    
    console.log('🔍 Backend getProducts query:', query);
    console.log('📄 Page:', page, 'Limit:', limit);
    
    let products;
    let total;
    
    // If limit is very high (like 1000), return all products without pagination
    if (limit >= 1000) {
      products = await Product.find(query);
      total = products.length;
      console.log('📦 Returning all products without pagination. Count:', products.length);
    } else {
      products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit));
      total = await Product.countDocuments(query);
      console.log('📦 Returning paginated products. Count:', products.length, 'Total:', total);
    }
    
    res.json({ products, total });
  } catch (err) { next(err); }
};

// Get single product (only active products)
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
};

// Get products by category (only active products)
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    let categoryName = category;
    
    // Try to find the category by ID to get the name
    try {
      const categoryDoc = await Category.findById(category);
      if (categoryDoc) {
        categoryName = categoryDoc.name;
      }
    } catch (err) {
      // If category ID is invalid, use the category parameter as is
      categoryName = category;
    }
    
    const products = await Product.find({ 
      category: categoryName, 
      isActive: true 
    });
    res.json(products);
  } catch (err) { next(err); }
};

// Get featured products (only active products)
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ 
      featured: true, 
      isActive: true 
    });
    res.json(products);
  } catch (err) { next(err); }
};

// Search products (only active products)
exports.searchProducts = async (req, res, next) => {
  try {
    const { q: query, category, minPrice, maxPrice, rating } = req.query;
    
    const searchQuery = { isActive: true };
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Category filter - support both category ID and category name
    if (category) {
      try {
        const categoryDoc = await Category.findById(category);
        if (categoryDoc) {
          searchQuery.category = categoryDoc.name;
        } else {
          searchQuery.category = category;
        }
      } catch (err) {
        searchQuery.category = category;
      }
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }
    
    // Rating filter
    if (rating) {
      searchQuery.rating = { $gte: parseFloat(rating) };
    }
    
    const products = await Product.find(searchQuery).limit(50);
    res.json(products);
  } catch (err) { next(err); }
};

// Get all products (admin only - includes inactive)
exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', category } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    
    // Handle category filtering - support both category ID and category name
    if (category) {
      try {
        const categoryDoc = await Category.findById(category);
        if (categoryDoc) {
          query.category = categoryDoc.name;
        } else {
          query.category = category;
        }
      } catch (err) {
        query.category = category;
      }
    }
    
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.json({ products, total });
  } catch (err) { next(err); }
};

// Create product (admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      // Placeholder: integrate with Cloudinary/S3 here
      data.image = `/uploads/${req.file.filename}`;
    }
    // Ensure new products are active by default for e-commerce visibility
    data.isActive = true;
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) { next(err); }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      // Placeholder: integrate with Cloudinary/S3 here
      data.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
};

// Toggle product active status (admin only)
exports.toggleProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    product.isActive = !product.isActive;
    await product.save();
    
    res.json({ 
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: product.isActive 
    });
  } catch (err) { next(err); }
};

// Add comment/review to product
exports.addComment = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id; // From auth middleware
    
    console.log('🔍 addComment called with:', { productId, userId, userFromToken: req.user });
    
    // Get userName from JWT token, or fetch from database if not available
    let userName = req.user.name;
    if (!userName) {
      console.log('⚠️ User name not in JWT token, fetching from database...');
      const User = require('../models/User');
      const user = await User.findById(userId).select('name');
      console.log('🔍 User lookup result:', user);
      if (user) {
        userName = user.name;
        console.log('✅ Found user name:', userName);
      } else {
        console.log('❌ User not found in database');
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      console.log('✅ User name from JWT token:', userName);
    }

    // Validate input
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already commented on this product
    const existingComment = product.comments.find(c => c.user.toString() === userId);
    if (existingComment) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add the comment
    product.comments.push({
      user: userId,
      userName: userName,
      rating: rating,
      comment: comment
    });

    // Update product rating and review count
    const totalRating = product.comments.reduce((sum, c) => sum + c.rating, 0);
    product.rating = totalRating / product.comments.length;
    product.reviewCount = product.comments.length;

    await product.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment: product.comments[product.comments.length - 1]
    });
  } catch (err) { 
    console.error('❌ Error in addComment:', err);
    next(err); 
  }
};

// Get comments for a product
exports.getComments = async (req, res, next) => {
  try {
    const productId = req.params.id;
    console.log('🔍 getComments called with productId:', productId);
    
    const product = await Product.findById(productId).populate('comments.user', 'name');
    console.log('📦 Product found:', product ? 'Yes' : 'No');
    
    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('💬 Comments count:', product.comments.length);
    res.json({
      comments: product.comments,
      averageRating: product.rating,
      totalReviews: product.reviewCount
    });
  } catch (err) { 
    console.error('❌ Error in getComments:', err);
    next(err); 
  }
};

// Seed sample product data (for development/testing)
exports.seedSampleData = async (req, res, next) => {
  try {
    // Check if products already exist
    const existingProducts = await Product.find();
    if (existingProducts.length > 0) {
      return res.json({ message: 'Sample data already exists', count: existingProducts.length });
    }

    const sampleProducts = [
      {
        name: "Samsung 55-inch 4K Smart TV",
        brand: "Samsung",
        category: "Electronics",
        price: 499.99,
        discountPrice: 399.99,
        rating: 4.5,
        reviewCount: 1247,
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
        description: "Experience stunning 4K Ultra HD resolution with HDR technology. Smart TV features with built-in apps and voice control.",
        inStock: true,
        stockCount: 45,
        features: ["4K Ultra HD", "HDR", "Smart TV", "Voice Control", "Multiple HDMI ports"],
        specifications: {
          screenSize: "55 inches",
          resolution: "3840 x 2160",
          refreshRate: "60Hz",
          connectivity: "Wi-Fi, Bluetooth, HDMI x4"
        },
        isActive: true
      },
      {
        name: "Apple iPhone 15 Pro",
        brand: "Apple",
        category: "Electronics",
        price: 999.99,
        discountPrice: 899.99,
        rating: 4.8,
        reviewCount: 2156,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
        description: "The most advanced iPhone ever with A17 Pro chip, titanium design, and pro camera system.",
        inStock: true,
        stockCount: 23,
        features: ["A17 Pro Chip", "Titanium Design", "Pro Camera System", "USB-C", "5G"],
        specifications: {
          storage: "128GB",
          color: "Natural Titanium",
          screenSize: "6.1 inches",
          battery: "Up to 23 hours"
        },
        isActive: true
      },
      {
        name: "Nike Air Max 270",
        brand: "Nike",
        category: "Clothing",
        price: 129.99,
        discountPrice: 99.99,
        rating: 4.3,
        reviewCount: 892,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        description: "Maximum comfort with the largest Air unit yet. Perfect for everyday wear and light workouts.",
        inStock: true,
        stockCount: 67,
        features: ["Air Max Unit", "Breathable Mesh", "Rubber Outsole", "Lightweight"],
        specifications: {
          sizes: ["7", "8", "9", "10", "11", "12"],
          colors: ["Black", "White", "Red"],
          material: "Mesh and Synthetic"
        },
        isActive: true
      },
      {
        name: "Instant Pot Duo 7-in-1",
        brand: "Instant Pot",
        category: "Home",
        price: 89.99,
        discountPrice: 69.99,
        rating: 4.6,
        reviewCount: 3421,
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        description: "7-in-1 multi-functional pressure cooker that replaces 7 kitchen appliances.",
        inStock: true,
        stockCount: 89,
        features: ["Pressure Cooker", "Slow Cooker", "Rice Cooker", "Steamer", "Sauté", "Yogurt Maker", "Warmer"],
        specifications: {
          capacity: "6 quarts",
          power: "1000W",
          material: "Stainless Steel",
          dimensions: "13.4 x 12.2 x 12.5 inches"
        },
        isActive: true
      },
      {
        name: "Adidas Ultraboost 22",
        brand: "Adidas",
        category: "Sports",
        price: 179.99,
        discountPrice: 149.99,
        rating: 4.4,
        reviewCount: 567,
        image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop",
        description: "Revolutionary running shoes with responsive Boost midsole and Primeknit upper.",
        inStock: true,
        stockCount: 34,
        features: ["Boost Midsole", "Primeknit Upper", "Continental Rubber", "Energy Return"],
        specifications: {
          sizes: ["7", "8", "9", "10", "11", "12"],
          colors: ["Black", "Blue", "White"],
          weight: "310g"
        },
        isActive: true
      }
    ];

    const createdProducts = await Product.insertMany(sampleProducts);
    res.status(201).json({ 
      message: 'Sample product data created successfully', 
      count: createdProducts.length 
    });
  } catch (err) { next(err); }
}; 