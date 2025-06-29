const mongoose = require('mongoose');
const Pricing = require('./src/models/Pricing');
const Product = require('./src/models/Product');
const Supplier = require('./src/models/Supplier');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/walmart_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Clear existing pricing data
    await Pricing.deleteMany({});
    console.log('Cleared existing pricing data');

    // Get existing products and suppliers
    const products = await Product.find();
    const suppliers = await Supplier.find();

    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      process.exit(0);
    }

    if (suppliers.length === 0) {
      console.log('No suppliers found. Please seed suppliers first.');
      process.exit(0);
    }

    console.log(`Found ${products.length} products and ${suppliers.length} suppliers`);

    // Create pricing items with supplier information
    const pricingItems = [];

    // Perishable items (fruits, dairy, bakery, vegetables)
    const perishableItems = [
      {
        name: "Organic Bananas",
        sku: "FRU-001",
        category: "Fruits",
        currentPrice: 2.99,
        originalPrice: 3.49,
        cost: 1.80,
        stock: 45,
        maxStock: 100,
        minStockLevel: 10,
        expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        isPerishable: true,
        demand: 85,
        clearanceRate: 92,
        wasteReduction: 78,
        mlScore: 94,
        status: "expiring_soon"
      },
      {
        name: "Fresh Milk",
        sku: "DAI-001",
        category: "Dairy",
        currentPrice: 4.49,
        originalPrice: 4.99,
        cost: 2.50,
        stock: 28,
        maxStock: 80,
        minStockLevel: 8,
        expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        isPerishable: true,
        demand: 120,
        clearanceRate: 89,
        wasteReduction: 82,
        mlScore: 91,
        status: "optimal"
      },
      {
        name: "Bakery Bread",
        sku: "BAK-001",
        category: "Bakery",
        currentPrice: 3.99,
        originalPrice: 4.49,
        cost: 1.90,
        stock: 15,
        maxStock: 50,
        minStockLevel: 5,
        expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        isPerishable: true,
        demand: 95,
        clearanceRate: 96,
        wasteReduction: 89,
        mlScore: 98,
        status: "critical"
      },
      {
        name: "Fresh Tomatoes",
        sku: "VEG-001",
        category: "Vegetables",
        currentPrice: 3.49,
        originalPrice: 3.99,
        cost: 2.20,
        stock: 32,
        maxStock: 75,
        minStockLevel: 8,
        expirationDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        isPerishable: true,
        demand: 68,
        clearanceRate: 85,
        wasteReduction: 73,
        mlScore: 87,
        status: "stable"
      },
      {
        name: "Organic Strawberries",
        sku: "FRU-002",
        category: "Fruits",
        currentPrice: 5.99,
        originalPrice: 6.49,
        cost: 3.50,
        stock: 22,
        maxStock: 60,
        minStockLevel: 6,
        expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        isPerishable: true,
        demand: 75,
        clearanceRate: 94,
        wasteReduction: 85,
        mlScore: 96,
        status: "expiring_soon"
      }
    ];

    // Non-perishable items (electronics, household, etc.)
    const nonPerishableItems = [
      {
        name: "Premium Widget A",
        sku: "PWA-001",
        category: "Electronics",
        currentPrice: 25.0,
        originalPrice: 25.0,
        cost: 18.0,
        stock: 1200,
        maxStock: 1500,
        minStockLevel: 100,
        isPerishable: false,
        demand: 850,
        clearanceRate: 88,
        wasteReduction: 65,
        mlScore: 92,
        status: "stable"
      },
      {
        name: "Standard Widget B",
        sku: "SWB-002",
        category: "Electronics",
        currentPrice: 15.0,
        originalPrice: 15.0,
        cost: 11.0,
        stock: 800,
        maxStock: 1000,
        minStockLevel: 80,
        isPerishable: false,
        demand: 1200,
        clearanceRate: 92,
        wasteReduction: 78,
        mlScore: 89,
        status: "optimal"
      },
      {
        name: "Deluxe Widget C",
        sku: "DWC-003",
        category: "Premium",
        currentPrice: 45.0,
        originalPrice: 45.0,
        cost: 32.0,
        stock: 300,
        maxStock: 500,
        minStockLevel: 30,
        isPerishable: false,
        demand: 420,
        clearanceRate: 85,
        wasteReduction: 72,
        mlScore: 94,
        status: "stable"
      },
      {
        name: "Household Cleaner",
        sku: "HHC-001",
        category: "Household",
        currentPrice: 8.99,
        originalPrice: 9.99,
        cost: 5.50,
        stock: 150,
        maxStock: 200,
        minStockLevel: 15,
        isPerishable: false,
        demand: 95,
        clearanceRate: 90,
        wasteReduction: 68,
        mlScore: 87,
        status: "optimal"
      },
      {
        name: "Kitchen Utensil Set",
        sku: "KUS-001",
        category: "Kitchen",
        currentPrice: 29.99,
        originalPrice: 34.99,
        cost: 18.0,
        stock: 75,
        maxStock: 100,
        minStockLevel: 10,
        isPerishable: false,
        demand: 45,
        clearanceRate: 82,
        wasteReduction: 75,
        mlScore: 91,
        status: "stable"
      }
    ];

    // Combine all items
    const allItems = [...perishableItems, ...nonPerishableItems];

    // Create pricing items with supplier information
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const product = products[i % products.length]; // Cycle through products
      const supplier = suppliers[i % suppliers.length]; // Cycle through suppliers

      const pricingItem = {
        productId: product._id,
        supplierId: supplier._id,
        supplierName: supplier.name,
        name: item.name,
        sku: item.sku,
        category: item.category,
        currentPrice: item.currentPrice,
        originalPrice: item.originalPrice,
        cost: item.cost,
        stock: item.stock,
        maxStock: item.maxStock,
        minStockLevel: item.minStockLevel,
        expirationDate: item.expirationDate,
        isPerishable: item.isPerishable,
        demand: item.demand,
        clearanceRate: item.clearanceRate,
        wasteReduction: item.wasteReduction,
        mlScore: item.mlScore,
        status: item.status,
        priceFactors: {
          expirationUrgency: Math.round((0.7 + Math.random() * 0.3) * 100),
          stockLevel: Math.round((0.3 + Math.random() * 0.4) * 100),
          timeOfDay: Math.round((0.6 + Math.random() * 0.3) * 100),
          demandForecast: Math.round((0.8 + Math.random() * 0.2) * 100),
          competitorPrice: Math.round((0.5 + Math.random() * 0.4) * 100),
          seasonality: Math.round((0.4 + Math.random() * 0.5) * 100),
          marketTrend: Math.round((0.6 + Math.random() * 0.3) * 100)
        },
        optimization: {
          wasteReduction: item.wasteReduction,
          clearanceRate: item.clearanceRate,
          revenueSaved: Math.round((item.currentPrice - item.cost) * item.demand * 0.1),
          lastOptimization: new Date()
        },
        history: [
          {
            price: item.currentPrice,
            reason: 'Initial creation',
            mlScore: item.mlScore
          }
        ]
      };

      pricingItems.push(pricingItem);
    }

    // Insert all pricing items
    const createdItems = await Pricing.insertMany(pricingItems);
    console.log(`Successfully created ${createdItems.length} pricing items with supplier information`);

    // Display summary
    console.log('\n=== Pricing Database Seeded Successfully ===');
    console.log(`Total pricing items: ${createdItems.length}`);
    console.log(`Perishable items: ${perishableItems.length}`);
    console.log(`Non-perishable items: ${nonPerishableItems.length}`);
    console.log(`Suppliers used: ${suppliers.length}`);
    console.log(`Products used: ${products.length}`);

    // Show some sample items
    console.log('\n=== Sample Pricing Items ===');
    const sampleItems = await Pricing.find().populate('supplierId').limit(3);
    sampleItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.sku})`);
      console.log(`   Supplier: ${item.supplierName}`);
      console.log(`   Price: $${item.currentPrice} (${item.priceChange})`);
      console.log(`   Stock: ${item.stock}/${item.maxStock}`);
      console.log(`   ML Score: ${item.mlScore}%`);
      console.log(`   Status: ${item.status}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error seeding pricing database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}); 