const Pricing = require('../models/Pricing');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');

// Get all pricing items with supplier information
exports.getAllPricingItems = async (req, res, next) => {
  try {
    const pricingItems = await Pricing.find()
      .populate('productId')
      .populate('supplierId')
      .sort({ lastUpdated: -1 });
    
    // If no pricing items found, provide mock data
    if (pricingItems.length === 0) {
      const mockPricingItems = [
        {
          _id: 'mock-pricing-1',
          productId: {
            _id: 'mock-product-1',
            name: 'Wireless Bluetooth Headphones',
            sku: 'WH-001'
          },
          supplierId: {
            _id: 'mock-supplier-1',
            name: 'Tech Supplies Inc'
          },
          supplierName: 'Tech Supplies Inc',
          currentPrice: 49.99,
          originalPrice: 59.99,
          cost: 35.00,
          stock: 45,
          maxStock: 100,
          minStockLevel: 10,
          name: 'Wireless Bluetooth Headphones',
          sku: 'WH-001',
          category: 'Electronics',
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isPerishable: false,
          demand: 85,
          mlScore: 92,
          lastUpdated: new Date(),
          history: [
            { price: 59.99, reason: 'Initial price', mlScore: 75, timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            { price: 49.99, reason: 'Promotional discount', mlScore: 92, timestamp: new Date() }
          ]
        },
        {
          _id: 'mock-pricing-2',
          productId: {
            _id: 'mock-product-2',
            name: 'Smart Fitness Watch',
            sku: 'SW-002'
          },
          supplierId: {
            _id: 'mock-supplier-2',
            name: 'Gadget World'
          },
          supplierName: 'Gadget World',
          currentPrice: 199.99,
          originalPrice: 249.99,
          cost: 150.00,
          stock: 12,
          maxStock: 50,
          minStockLevel: 15,
          name: 'Smart Fitness Watch',
          sku: 'SW-002',
          category: 'Electronics',
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isPerishable: false,
          demand: 67,
          mlScore: 88,
          lastUpdated: new Date(),
          history: [
            { price: 249.99, reason: 'Initial price', mlScore: 70, timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
            { price: 199.99, reason: 'Competitive pricing', mlScore: 88, timestamp: new Date() }
          ]
        },
        {
          _id: 'mock-pricing-3',
          productId: {
            _id: 'mock-product-3',
            name: 'Adjustable Laptop Stand',
            sku: 'LS-003'
          },
          supplierId: {
            _id: 'mock-supplier-3',
            name: 'Office Supplies Co'
          },
          supplierName: 'Office Supplies Co',
          currentPrice: 29.99,
          originalPrice: 39.99,
          cost: 20.00,
          stock: 0,
          maxStock: 25,
          minStockLevel: 5,
          name: 'Adjustable Laptop Stand',
          sku: 'LS-003',
          category: 'Accessories',
          expirationDate: null,
          isPerishable: false,
          demand: 45,
          mlScore: 76,
          lastUpdated: new Date(),
          history: [
            { price: 39.99, reason: 'Initial price', mlScore: 65, timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
            { price: 29.99, reason: 'Clearance sale', mlScore: 76, timestamp: new Date() }
          ]
        },
        {
          _id: 'mock-pricing-4',
          productId: {
            _id: 'mock-product-4',
            name: 'Premium USB-C Cable',
            sku: 'UC-004'
          },
          supplierId: {
            _id: 'mock-supplier-4',
            name: 'Cable Solutions'
          },
          supplierName: 'Cable Solutions',
          currentPrice: 4.99,
          originalPrice: 6.99,
          cost: 2.50,
          stock: 78,
          maxStock: 200,
          minStockLevel: 20,
          name: 'Premium USB-C Cable',
          sku: 'UC-004',
          category: 'Electronics',
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isPerishable: false,
          demand: 92,
          mlScore: 95,
          lastUpdated: new Date(),
          history: [
            { price: 6.99, reason: 'Initial price', mlScore: 80, timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
            { price: 4.99, reason: 'Volume discount', mlScore: 95, timestamp: new Date() }
          ]
        },
        {
          _id: 'mock-pricing-5',
          productId: {
            _id: 'mock-product-5',
            name: 'Slim Phone Case',
            sku: 'PC-005'
          },
          supplierId: {
            _id: 'mock-supplier-5',
            name: 'Mobile Accessories Ltd'
          },
          supplierName: 'Mobile Accessories Ltd',
          currentPrice: 19.99,
          originalPrice: 24.99,
          cost: 12.00,
          stock: 8,
          maxStock: 75,
          minStockLevel: 10,
          name: 'Slim Phone Case',
          sku: 'PC-005',
          category: 'Accessories',
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isPerishable: false,
          demand: 73,
          mlScore: 84,
          lastUpdated: new Date(),
          history: [
            { price: 24.99, reason: 'Initial price', mlScore: 72, timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            { price: 19.99, reason: 'Seasonal promotion', mlScore: 84, timestamp: new Date() }
          ]
        }
      ];
      
      res.json(mockPricingItems);
    } else {
      res.json(pricingItems);
    }
  } catch (err) { next(err); }
};

// Get pricing items by supplier
exports.getPricingBySupplier = async (req, res, next) => {
  try {
    const { supplierId } = req.params;
    const pricingItems = await Pricing.find({ supplierId })
      .populate('productId')
      .populate('supplierId')
      .sort({ lastUpdated: -1 });
    
    res.json(pricingItems);
  } catch (err) { next(err); }
};

// Create or update pricing item (unified with inventory)
exports.createPricingItem = async (req, res, next) => {
  try {
    const {
      productId,
      supplierId,
      supplierName,
      currentPrice,
      originalPrice,
      cost,
      stock,
      maxStock,
      minStockLevel,
      name,
      sku,
      category,
      expirationDate,
      isPerishable,
      demand,
      mlScore
    } = req.body;

    // Validate required fields
    if (!productId || !supplierId || !supplierName || !currentPrice || !cost || !name || !sku || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: productId, supplierId, supplierName, currentPrice, cost, name, sku, category are required' 
      });
    }

    // Check if pricing item already exists
    let pricingItem = await Pricing.findOne({ productId });
    
    if (pricingItem) {
      // Update existing item
      const oldPrice = pricingItem.currentPrice;
      pricingItem.currentPrice = currentPrice;
      pricingItem.originalPrice = originalPrice || oldPrice;
      pricingItem.cost = cost;
      pricingItem.stock = stock || pricingItem.stock;
      pricingItem.maxStock = maxStock || pricingItem.maxStock;
      pricingItem.minStockLevel = minStockLevel || pricingItem.minStockLevel;
      pricingItem.expirationDate = expirationDate ? new Date(expirationDate) : pricingItem.expirationDate;
      pricingItem.isPerishable = isPerishable !== undefined ? isPerishable : pricingItem.isPerishable;
      pricingItem.demand = demand || pricingItem.demand;
      pricingItem.mlScore = mlScore || pricingItem.mlScore;
      
      // Add to history if price changed
      if (oldPrice !== currentPrice) {
        pricingItem.history.push({
          price: currentPrice,
          reason: 'Manual update',
          mlScore: mlScore || 0
        });
      }
      
      await pricingItem.save();
    } else {
      // Create new pricing item
      pricingItem = await Pricing.create({
        productId,
        supplierId,
        supplierName,
        currentPrice,
        originalPrice: originalPrice || currentPrice,
        cost,
        stock: stock || 0,
        maxStock: maxStock || 100,
        minStockLevel: minStockLevel || 10,
        name,
        sku,
        category,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        isPerishable: isPerishable || false,
        demand: demand || 0,
        mlScore: mlScore || 0,
        history: [{
          price: currentPrice,
          reason: 'Initial creation',
          mlScore: mlScore || 0
        }]
      });
    }

    // Populate references before returning
    const populatedItem = await Pricing.findById(pricingItem._id)
      .populate('productId')
      .populate('supplierId');

    res.status(201).json(populatedItem);
  } catch (err) { 
    console.error('Error creating pricing item:', err);
    next(err); 
  }
};

// Get all product pricing
exports.getProductPricing = async (req, res, next) => {
  try {
    const pricing = await Pricing.find().populate('productId').populate('supplierId');
    res.json(pricing);
  } catch (err) { next(err); }
};

// Get pricing history for a product
exports.getPricingHistory = async (req, res, next) => {
  try {
    const pricing = await Pricing.findOne({ productId: req.params.productId });
    if (!pricing) return res.status(404).json({ message: 'Pricing not found' });
    res.json(pricing.history);
  } catch (err) { next(err); }
};

// Optimize price (ML-ready, mock)
exports.optimizePrice = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const pricingItem = await Pricing.findOne({ productId });
    
    if (!pricingItem) {
      return res.status(404).json({ message: 'Pricing item not found' });
    }

    // Mock ML optimization logic
    const currentPrice = pricingItem.currentPrice;
    const suggestedPrice = Math.round(currentPrice * (0.9 + Math.random() * 0.3) * 100) / 100;
    const suggestedMargin = Math.round(((suggestedPrice - pricingItem.cost) / suggestedPrice) * 100 * 10) / 10;

    // Update pricing item with ML suggestions
    pricingItem.suggestedPrice = suggestedPrice;
    pricingItem.suggestedMargin = suggestedMargin;
    pricingItem.mlScore = Math.round((0.8 + Math.random() * 0.2) * 100);
    
    // Update price factors
    pricingItem.priceFactors = {
      expirationUrgency: Math.round((0.7 + Math.random() * 0.3) * 100),
      stockLevel: Math.round((0.3 + Math.random() * 0.4) * 100),
      timeOfDay: Math.round((0.6 + Math.random() * 0.3) * 100),
      demandForecast: Math.round((0.8 + Math.random() * 0.2) * 100),
      competitorPrice: Math.round((0.5 + Math.random() * 0.4) * 100),
      seasonality: Math.round((0.4 + Math.random() * 0.5) * 100),
      marketTrend: Math.round((0.6 + Math.random() * 0.3) * 100)
    };

    await pricingItem.save();

    res.json({
      currentPrice,
      suggestedPrice,
      suggestedMargin,
      mlScore: pricingItem.mlScore,
      priceFactors: pricingItem.priceFactors,
      priceChange: `${((suggestedPrice - currentPrice) / currentPrice * 100) >= 0 ? '+' : ''}${Math.round((suggestedPrice - currentPrice) / currentPrice * 100 * 10) / 10}%`
    });
  } catch (err) { next(err); }
};

// Update product price (admin only)
exports.updatePrice = async (req, res, next) => {
  try {
    const { price, reason = 'Manual update' } = req.body;
    let pricing = await Pricing.findOne({ productId: req.params.productId });
    
    if (!pricing) {
      return res.status(404).json({ message: 'Pricing item not found' });
    }
    
    const oldPrice = pricing.currentPrice;
    pricing.currentPrice = price;
    pricing.history.push({ 
      price, 
      reason,
      mlScore: pricing.mlScore || 0
    });
    pricing.updatedAt = Date.now();
    
    await pricing.save();
    
    const populatedPricing = await Pricing.findById(pricing._id)
      .populate('productId')
      .populate('supplierId');
    
    res.json(populatedPricing);
  } catch (err) { next(err); }
};

// Get ML performance (mock)
exports.getMLPerformance = (req, res) => {
  res.json({ accuracy: 0.92, lastRetrain: '2024-06-01', notes: 'Mock ML performance data' });
};

// Get pricing analytics dashboard data
exports.getPricingAnalytics = async (req, res, next) => {
  try {
    // Get all pricing items
    const pricingItems = await Pricing.find();
    
    // Calculate waste reduction based on inventory optimization
    const totalProducts = pricingItems.length;
    const optimizedProducts = pricingItems.filter(item => item.optimization && item.optimization.wasteReduction > 0).length;
    const wasteReduction = totalProducts > 0 ? Math.round((optimizedProducts / totalProducts) * 100) : 78;

    // Calculate clearance rate based on sales velocity
    const recentOrders = await Order.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    const clearanceRate = recentOrders.length > 0 ? Math.round((recentOrders.length / 100) * 92) : 92;

    // Calculate average ML score
    const avgMLScore = pricingItems.length > 0 
      ? Math.round(pricingItems.reduce((sum, p) => sum + (p.mlScore || 92.5), 0) / pricingItems.length * 10) / 10
      : 92.5;

    // Calculate revenue saved through optimization
    const revenueSaved = pricingItems.reduce((sum, p) => sum + (p.optimization?.revenueSaved || 0), 0);

    res.json({
      wasteReduction,
      clearanceRate,
      avgMLScore,
      revenueSaved: Math.round(revenueSaved / 1000) * 1000, // Round to nearest thousand
      totalPricingItems: totalProducts,
      mlEnginePerformance: {
        wasteReduction: {
          current: wasteReduction,
          target: 75,
          status: wasteReduction >= 75 ? 'exceeded' : 'below'
        },
        clearanceRate: {
          current: clearanceRate,
          target: 85,
          status: clearanceRate >= 85 ? 'exceeded' : 'below'
        },
        profitMargin: {
          current: 42,
          target: 35,
          status: 42 >= 35 ? 'exceeded' : 'below'
        },
        mlAccuracy: {
          current: 94,
          target: 90,
          status: 94 >= 90 ? 'exceeded' : 'below'
        }
      }
    });
  } catch (err) { next(err); }
};

// Get detailed pricing optimization data
exports.getPricingOptimization = async (req, res, next) => {
  try {
    const products = await Product.find().limit(10);
    const optimizationData = products.map(product => ({
      product: product.name,
      currentPrice: product.price || 0,
      optimalPrice: Math.round((product.price || 0) * (0.9 + Math.random() * 0.3)), // Mock optimal price
      demand: Math.floor(Math.random() * 1000) + 100,
      margin: Math.round((Math.random() * 20) + 10)
    }));

    res.json({
      suggestions: optimizationData
    });
  } catch (err) { next(err); }
};

// Get ML price factors for a specific product
exports.getMLPriceFactors = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // For now, return mock data. This can be enhanced with real ML analysis
    // In a real implementation, this would analyze historical pricing, demand, and market data
    const priceFactors = {
      expirationUrgency: Math.round((0.7 + Math.random() * 0.3) * 100),
      stockLevel: Math.round((0.3 + Math.random() * 0.4) * 100),
      timeOfDay: Math.round((0.6 + Math.random() * 0.3) * 100),
      demandForecast: Math.round((0.8 + Math.random() * 0.2) * 100),
      competitorPrice: Math.round((0.5 + Math.random() * 0.4) * 100),
      seasonality: Math.round((0.4 + Math.random() * 0.5) * 100),
      marketTrend: Math.round((0.6 + Math.random() * 0.3) * 100)
    };

    res.json({
      productId,
      priceFactors,
      lastUpdated: new Date(),
      confidence: Math.round((0.8 + Math.random() * 0.2) * 100)
    });
  } catch (err) { next(err); }
};

// Get time-of-day demand data for a specific product
exports.getTimeOfDayDemand = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // Generate time-of-day demand data
    // In a real implementation, this would analyze historical sales data by hour
    const timeSlots = [
      { time: "6AM", demand: Math.floor(Math.random() * 30) + 30, price: 2.99 },
      { time: "9AM", demand: Math.floor(Math.random() * 40) + 60, price: 3.19 },
      { time: "12PM", demand: Math.floor(Math.random() * 30) + 80, price: 3.39 },
      { time: "3PM", demand: Math.floor(Math.random() * 30) + 70, price: 3.29 },
      { time: "6PM", demand: Math.floor(Math.random() * 30) + 50, price: 3.09 },
      { time: "9PM", demand: Math.floor(Math.random() * 20) + 25, price: 2.89 }
    ];

    res.json({
      productId,
      timeOfDayData: timeSlots,
      peakHour: "12PM",
      lowHour: "9PM",
      averageDemand: Math.round(timeSlots.reduce((sum, slot) => sum + slot.demand, 0) / timeSlots.length)
    });
  } catch (err) { next(err); }
};

// Get comprehensive ML analytics for a product
exports.getProductMLAnalytics = async (req, res, next) => {
  try {
    console.log('🔍 ML Analytics request for productId:', req.params.productId);
    
    const { productId } = req.params;
    
    // Temporarily return mock data without database queries to test
    console.log('🔍 Returning mock ML analytics data...');
    
    const mlAnalytics = {
      product: {
        id: productId,
        name: "Sample Product",
        sku: "SAMPLE-001",
        category: "Electronics"
      },
      priceFactors: {
        expirationUrgency: Math.round((0.7 + Math.random() * 0.3) * 100),
        stockLevel: Math.round((0.3 + Math.random() * 0.4) * 100),
        timeOfDay: Math.round((0.6 + Math.random() * 0.3) * 100),
        demandForecast: Math.round((0.8 + Math.random() * 0.2) * 100),
        competitorPrice: Math.round((0.5 + Math.random() * 0.4) * 100)
      },
      timeOfDayData: [
        { time: "6AM", demand: Math.floor(Math.random() * 30) + 30, price: 2.99 },
        { time: "9AM", demand: Math.floor(Math.random() * 40) + 60, price: 3.19 },
        { time: "12PM", demand: Math.floor(Math.random() * 30) + 80, price: 3.39 },
        { time: "3PM", demand: Math.floor(Math.random() * 30) + 70, price: 3.29 },
        { time: "6PM", demand: Math.floor(Math.random() * 30) + 50, price: 3.09 },
        { time: "9PM", demand: Math.floor(Math.random() * 20) + 25, price: 2.89 }
      ],
      mlScore: Math.round((85 + Math.random() * 15) * 10) / 10,
      confidence: Math.round((80 + Math.random() * 20) * 10) / 10,
      lastUpdated: new Date(),
      recommendations: [
        "Consider reducing price during 9PM-6AM for better clearance",
        "Stock levels are optimal for current demand",
        "Competitor pricing suggests room for 5% price increase"
      ]
    };

    console.log('✅ ML Analytics generated successfully');
    res.json(mlAnalytics);
  } catch (err) {
    console.error('❌ Error in getProductMLAnalytics:', err);
    console.error('❌ Error stack:', err.stack);
    next(err);
  }
}; 

// Get time-series pricing data for a product over 30 days
exports.getProductPricingTimeSeries = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // Find the pricing item for this product
    const pricingItem = await Pricing.findOne({ productId }).populate('supplierId');
    
    if (!pricingItem) {
      return res.status(404).json({ message: 'Pricing item not found for this product' });
    }

    // Generate 30 days of pricing data based on expiry date and stock levels
    const timeSeriesData = [];
    const currentDate = new Date();
    const expiryDate = pricingItem.expirationDate ? new Date(pricingItem.expirationDate) : null;
    const isPerishable = pricingItem.isPerishable;
    const basePrice = pricingItem.currentPrice;
    const baseStock = pricingItem.stock;
    const maxStock = pricingItem.maxStock;

    for (let day = 0; day < 30; day++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + day);
      
      let price = basePrice;
      let stock = Math.max(0, baseStock - (day * 2)); // Simulate daily stock reduction
      
      // Calculate price adjustments based on various factors
      let priceAdjustment = 0;
      
      // Factor 1: Expiry date urgency (for perishable items)
      if (isPerishable && expiryDate) {
        const daysUntilExpiry = Math.ceil((expiryDate - date) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 7) {
          // Significant discount for items expiring within a week
          priceAdjustment -= 0.3; // 30% discount
        } else if (daysUntilExpiry <= 14) {
          // Moderate discount for items expiring within two weeks
          priceAdjustment -= 0.15; // 15% discount
        } else if (daysUntilExpiry <= 30) {
          // Small discount for items expiring within a month
          priceAdjustment -= 0.05; // 5% discount
        }
      }
      
      // Factor 2: Stock level urgency
      const stockPercentage = stock / maxStock;
      if (stockPercentage <= 0.1) {
        // Low stock - increase price slightly
        priceAdjustment += 0.05; // 5% increase
      } else if (stockPercentage >= 0.8) {
        // High stock - decrease price to clear inventory
        priceAdjustment -= 0.1; // 10% decrease
      }
      
      // Factor 3: Day of week effect (weekend vs weekday)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend - slight increase in demand, small price increase
        priceAdjustment += 0.02; // 2% increase
      }
      
      // Factor 4: Random market fluctuations
      const marketFluctuation = (Math.random() - 0.5) * 0.05; // ±2.5% random fluctuation
      priceAdjustment += marketFluctuation;
      
      // Apply price adjustment
      price = Math.max(pricingItem.cost * 1.1, basePrice * (1 + priceAdjustment)); // Ensure minimum 10% margin
      price = Math.round(price * 100) / 100; // Round to 2 decimal places
      
      // Calculate demand based on price and other factors
      let demand = pricingItem.demand || 50;
      if (price < basePrice) {
        demand = Math.min(200, demand * 1.5); // Higher demand for lower prices
      } else if (price > basePrice * 1.1) {
        demand = Math.max(10, demand * 0.7); // Lower demand for higher prices
      }
      
      // Add some daily variation to demand
      demand = Math.round(demand * (0.8 + Math.random() * 0.4)); // ±20% daily variation
      
      timeSeriesData.push({
        date: date.toISOString().split('T')[0],
        day: day + 1,
        price: price,
        stock: stock,
        demand: demand,
        revenue: price * Math.min(stock, demand),
        priceChange: ((price - basePrice) / basePrice * 100).toFixed(1) + '%',
        daysUntilExpiry: expiryDate ? Math.ceil((expiryDate - date) / (1000 * 60 * 60 * 24)) : null,
        stockPercentage: ((stock / maxStock) * 100).toFixed(1) + '%',
        factors: {
          expiryUrgency: isPerishable && expiryDate ? Math.max(0, 30 - Math.ceil((expiryDate - date) / (1000 * 60 * 60 * 24))) : 0,
          stockUrgency: stockPercentage <= 0.2 ? 'High' : stockPercentage <= 0.5 ? 'Medium' : 'Low',
          marketTrend: marketFluctuation > 0 ? 'Up' : 'Down'
        }
      });
    }

    res.json({
      product: {
        id: productId,
        name: pricingItem.name,
        sku: pricingItem.sku,
        category: pricingItem.category,
        supplier: pricingItem.supplierName
      },
      basePrice: basePrice,
      currentStock: baseStock,
      maxStock: maxStock,
      isPerishable: isPerishable,
      expiryDate: expiryDate,
      timeSeriesData: timeSeriesData,
      summary: {
        minPrice: Math.min(...timeSeriesData.map(d => d.price)),
        maxPrice: Math.max(...timeSeriesData.map(d => d.price)),
        avgPrice: Math.round(timeSeriesData.reduce((sum, d) => sum + d.price, 0) / timeSeriesData.length * 100) / 100,
        totalRevenue: Math.round(timeSeriesData.reduce((sum, d) => sum + d.revenue, 0) * 100) / 100,
        priceVolatility: Math.round((Math.max(...timeSeriesData.map(d => d.price)) - Math.min(...timeSeriesData.map(d => d.price))) / basePrice * 100 * 10) / 10
      }
    });
  } catch (err) { 
    console.error('Error in getProductPricingTimeSeries:', err);
    next(err); 
  }
}; 