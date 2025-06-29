require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./src/models/User');
const Supplier = require('./src/models/Supplier');
const Product = require('./src/models/Product');
const Inventory = require('./src/models/Inventory');
const Category = require('./src/models/Category');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Create admin user
async function createAdmin() {
  console.log('👤 Creating admin user...');

  const existingAdmin = await User.findOne({ email: 'admin@supply.com' });
  if (existingAdmin) {
    console.log('⚠️ Admin user already exists. Skipping creation.');
    return;
  }

  const adminUser = new User({
    name: 'Admin User',
    email: 'admin@supply.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  });

  await adminUser.save();
  console.log('✅ Admin user created successfully');
}

// Create sample categories
async function createCategories() {
  console.log('📂 Creating sample categories...');

  const categories = [
    { name: 'Electronics', description: 'Electronic devices and gadgets' },
    { name: 'Clothing', description: 'Apparel and fashion items' },
    { name: 'Home', description: 'Home and garden products' },
    { name: 'Sports', description: 'Sports equipment and accessories' },
    { name: 'Books', description: 'Books and educational materials' },
    { name: 'Toys', description: 'Toys and games' },
    { name: 'Accessories', description: 'Various accessories and add-ons' }
  ];

  const createdCategories = await Category.insertMany(categories);
  console.log(`✅ Created ${createdCategories.length} categories`);
  return createdCategories;
}

// Create sample suppliers
async function createSuppliers() {
  console.log('🏢 Creating sample suppliers...');

  const suppliers = [
    {
      name: 'TechCorp Electronics',
      contact: 'John Smith',
      email: 'john@techcorp.com',
      phone: '+1-555-0123',
      status: 'active',
      rating: 4.5,
      performance: {
        onTimeDelivery: 95,
        qualityFailures: 2,
        contractCompliance: 98,
        reliabilityScore: 92,
        totalDeliveries: 150,
        failedInspections: 3,
        alerts: ['High demand expected for Q4']
      }
    },
    {
      name: 'Global Sports Supply',
      contact: 'Sarah Johnson',
      email: 'sarah@globalsports.com',
      phone: '+1-555-0456',
      status: 'active',
      rating: 4.2,
      performance: {
        onTimeDelivery: 88,
        qualityFailures: 5,
        contractCompliance: 92,
        reliabilityScore: 85,
        totalDeliveries: 89,
        failedInspections: 7,
        alerts: ['Supply chain delays affecting delivery times']
      }
    },
    {
      name: 'Home Essentials Plus',
      contact: 'Mike Wilson',
      email: 'mike@homeessentials.com',
      phone: '+1-555-0789',
      status: 'active',
      rating: 4.7,
      performance: {
        onTimeDelivery: 97,
        qualityFailures: 1,
        contractCompliance: 99,
        reliabilityScore: 96,
        totalDeliveries: 234,
        failedInspections: 2,
        alerts: []
      }
    },
    {
      name: 'Fashion Forward',
      contact: 'Emma Davis',
      email: 'emma@fashionforward.com',
      phone: '+1-555-0321',
      status: 'active',
      rating: 4.3,
      performance: {
        onTimeDelivery: 90,
        qualityFailures: 3,
        contractCompliance: 94,
        reliabilityScore: 88,
        totalDeliveries: 120,
        failedInspections: 4,
        alerts: ['New seasonal collection arriving']
      }
    },
    {
      name: 'Book Haven',
      contact: 'David Brown',
      email: 'david@bookhaven.com',
      phone: '+1-555-0654',
      status: 'active',
      rating: 4.6,
      performance: {
        onTimeDelivery: 93,
        qualityFailures: 1,
        contractCompliance: 97,
        reliabilityScore: 94,
        totalDeliveries: 85,
        failedInspections: 1,
        alerts: []
      }
    }
  ];

  const createdSuppliers = await Supplier.insertMany(suppliers);
  console.log(`✅ Created ${createdSuppliers.length} suppliers`);
  return createdSuppliers;
}

// Create comprehensive sample products
async function createProducts(suppliers) {
  console.log('📦 Creating comprehensive sample products...');

  const sampleProducts = [
    // Electronics Products
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
      supplier: suppliers[0]._id,
      supplierName: suppliers[0].name,
      sku: "ELE-001-001",
      featured: true,
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
      supplier: suppliers[0]._id,
      supplierName: suppliers[0].name,
      sku: "ELE-002-002",
      featured: true,
      isActive: true
    },
    {
      name: "MacBook Air M2",
      brand: "Apple",
      category: "Electronics",
      price: 1199.99,
      discountPrice: 1099.99,
      rating: 4.7,
      reviewCount: 892,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
      description: "Ultra-thin laptop with M2 chip, all-day battery life, and stunning Retina display.",
      inStock: true,
      stockCount: 18,
      features: ["M2 Chip", "Retina Display", "All-day Battery", "Thunderbolt 4", "Backlit Keyboard"],
      specifications: {
        storage: "256GB",
        memory: "8GB",
        screenSize: "13.6 inches",
        weight: "2.7 pounds"
      },
      supplier: suppliers[0]._id,
      supplierName: suppliers[0].name,
      sku: "ELE-003-003",
      featured: true,
      isActive: true
    },
    {
      name: "Sony WH-1000XM4 Headphones",
      brand: "Sony",
      category: "Electronics",
      price: 349.99,
      discountPrice: 299.99,
      rating: 4.6,
      reviewCount: 1567,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      description: "Industry-leading noise canceling wireless headphones with 30-hour battery life.",
      inStock: true,
      stockCount: 67,
      features: ["Noise Canceling", "30-hour Battery", "Touch Controls", "Quick Charge", "Multi-device Pairing"],
      specifications: {
        batteryLife: "30 hours",
        weight: "254g",
        connectivity: "Bluetooth 5.0",
        frequency: "4Hz-40kHz"
      },
      supplier: suppliers[0]._id,
      supplierName: suppliers[0].name,
      sku: "ELE-004-004",
      featured: false,
      isActive: true
    },

    // Clothing Products
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
      supplier: suppliers[1]._id,
      supplierName: suppliers[1].name,
      sku: "CLO-001-005",
      featured: true,
      isActive: true
    },
    {
      name: "Adidas Ultraboost 22",
      brand: "Adidas",
      category: "Clothing",
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
      supplier: suppliers[1]._id,
      supplierName: suppliers[1].name,
      sku: "CLO-002-006",
      featured: false,
      isActive: true
    },
    {
      name: "Levi's 501 Original Jeans",
      brand: "Levi's",
      category: "Clothing",
      price: 89.99,
      discountPrice: 69.99,
      rating: 4.2,
      reviewCount: 445,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop",
      description: "The original straight leg jeans that started it all. Classic fit with authentic vintage styling.",
      inStock: true,
      stockCount: 89,
      features: ["Original Fit", "Straight Leg", "Vintage Styling", "Durable Denim"],
      specifications: {
        sizes: ["28", "30", "32", "34", "36", "38"],
        colors: ["Blue", "Black", "Light Blue"],
        material: "100% Cotton Denim"
      },
      supplier: suppliers[3]._id,
      supplierName: suppliers[3].name,
      sku: "CLO-003-007",
      featured: false,
      isActive: true
    },

    // Home Products
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
      supplier: suppliers[2]._id,
      supplierName: suppliers[2].name,
      sku: "HOM-001-008",
      featured: true,
      isActive: true
    },
    {
      name: "Dyson V15 Detect Cordless Vacuum",
      brand: "Dyson",
      category: "Home",
      price: 699.99,
      discountPrice: 599.99,
      rating: 4.5,
      reviewCount: 1234,
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
      description: "Powerful cordless vacuum with laser dust detection and 60-minute runtime.",
      inStock: true,
      stockCount: 23,
      features: ["Laser Detection", "60-min Runtime", "HEPA Filtration", "LCD Screen", "Cordless"],
      specifications: {
        runtime: "60 minutes",
        suction: "240 AW",
        weight: "2.6kg",
        battery: "Removable Lithium-ion"
      },
      supplier: suppliers[2]._id,
      supplierName: suppliers[2].name,
      sku: "HOM-002-009",
      featured: false,
      isActive: true
    },

    // Sports Products
    {
      name: "Wilson Pro Staff Tennis Racket",
      brand: "Wilson",
      category: "Sports",
      price: 199.99,
      discountPrice: 179.99,
      rating: 4.4,
      reviewCount: 234,
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop",
      description: "Professional tennis racket with perfect balance and control for advanced players.",
      inStock: true,
      stockCount: 45,
      features: ["Professional Grade", "Perfect Balance", "Control Focused", "Durable Frame"],
      specifications: {
        headSize: "97 sq inches",
        weight: "315g",
        stringPattern: "16x19",
        gripSize: "4 1/4"
      },
      supplier: suppliers[1]._id,
      supplierName: suppliers[1].name,
      sku: "SPO-001-010",
      featured: false,
      isActive: true
    },

    // Books
    {
      name: "The Great Gatsby",
      brand: "F. Scott Fitzgerald",
      category: "Books",
      price: 12.99,
      discountPrice: 9.99,
      rating: 4.7,
      reviewCount: 5678,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop",
      description: "A classic American novel about the Jazz Age and the American Dream.",
      inStock: true,
      stockCount: 156,
      features: ["Classic Literature", "Paperback", "Annotated Edition", "Study Guide Included"],
      specifications: {
        pages: "180",
        language: "English",
        format: "Paperback",
        isbn: "978-0743273565"
      },
      supplier: suppliers[4]._id,
      supplierName: suppliers[4].name,
      sku: "BOO-001-011",
      featured: true,
      isActive: true
    },
    {
      name: "To Kill a Mockingbird",
      brand: "Harper Lee",
      category: "Books",
      price: 14.99,
      discountPrice: 11.99,
      rating: 4.8,
      reviewCount: 4321,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      description: "A powerful story of racial injustice and loss of innocence in the American South.",
      inStock: true,
      stockCount: 98,
      features: ["Pulitzer Prize Winner", "Hardcover", "Collector's Edition", "Author's Note"],
      specifications: {
        pages: "376",
        language: "English",
        format: "Hardcover",
        isbn: "978-0446310789"
      },
      supplier: suppliers[4]._id,
      supplierName: suppliers[4].name,
      sku: "BOO-002-012",
      featured: false,
      isActive: true
    }
  ];

  const createdProducts = await Product.insertMany(sampleProducts);
  console.log(`✅ Created ${createdProducts.length} products`);
  return createdProducts;
}

// Create inventory items for all products
async function createInventoryItems(products) {
  console.log('📋 Creating inventory items for all products...');

  const inventoryItems = products.map(product => ({
    productId: product._id,
    quantity: product.stockCount,
    location: 'Warehouse A',
    minStockLevel: 10,
    maxStockLevel: 100,
    supplier: product.supplier,
    supplierName: product.supplierName,
    batchNumber: `BATCH-${product.sku}`,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    purchaseDate: new Date(),
    purchasePrice: product.price * 0.7, // 30% margin
    status: 'active',
    notes: `Auto-generated inventory item for ${product.name}`
  }));

  const createdInventory = await Inventory.insertMany(inventoryItems);
  console.log(`✅ Created ${createdInventory.length} inventory items`);
  return createdInventory;
}

// Run seeding
async function seed() {
  await connectDB();
  
  // Clear existing data to ensure consistency
  console.log('🧹 Clearing existing data...');
  await User.deleteMany({});
  await Category.deleteMany({});
  await Supplier.deleteMany({});
  await Product.deleteMany({});
  await Inventory.deleteMany({});
  console.log('✅ Existing data cleared');
  
  await createAdmin();
  await createCategories();
  const suppliers = await createSuppliers();
  const products = await createProducts(suppliers);
  await createInventoryItems(products);
  console.log('🎉 Database seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Admin user: admin@supply.com / admin123`);
  console.log(`   - Categories: 7`);
  console.log(`   - Suppliers: ${suppliers.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Inventory items: ${products.length}`);
  console.log(`   - All products are now available in both inventory and e-commerce!`);
  mongoose.disconnect();
}

seed();
