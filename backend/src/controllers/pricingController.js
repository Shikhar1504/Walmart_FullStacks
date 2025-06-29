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
    
    res.json(pricingItems);
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