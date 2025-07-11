const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const Category = require('../models/Category');

// Get dashboard overview with all KPIs
exports.getOverview = async (req, res, next) => {
  try {
    // Get date range for filtering (default: last 30 days)
    const { period = '30d' } = req.query;
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Total orders and revenue
    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Total products
    const totalProducts = await Product.countDocuments();

    // Low stock alerts
    const lowStockItems = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $match: {
          $expr: { $lte: ['$quantity', '$minStockLevel'] }
        }
      },
      {
        $project: {
          name: '$product.name',
          quantity: 1,
          minStockLevel: 1,
          status: {
            $cond: {
              if: { $eq: ['$quantity', 0] },
              then: 'Out of Stock',
              else: 'Low Stock'
            }
          }
        }
      }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          totalRevenue: 1,
          image: '$product.image'
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Revenue trend (last 7 days)
    const revenueTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };

    // Check if we have real data, if not provide mock data
    const hasRealData = stats.totalOrders > 0 || totalCustomers > 0 || totalProducts > 0;
    
    if (!hasRealData) {
      // Generate mock data
      const mockRecentOrders = [
        {
          _id: 'mock1',
          orderNumber: 'ORD-001',
          total: 299.99,
          status: 'processing',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          userId: { name: 'John Doe', email: 'john@example.com' }
        },
        {
          _id: 'mock2',
          orderNumber: 'ORD-002',
          total: 149.50,
          status: 'shipped',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          userId: { name: 'Jane Smith', email: 'jane@example.com' }
        },
        {
          _id: 'mock3',
          orderNumber: 'ORD-003',
          total: 89.99,
          status: 'delivered',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          userId: { name: 'Bob Johnson', email: 'bob@example.com' }
        }
      ];

      const mockTopProducts = [
        { name: 'Wireless Headphones', totalSold: 45, totalRevenue: 2245.50, image: '/images/headphones.jpg' },
        { name: 'Smart Watch', totalSold: 32, totalRevenue: 3198.40, image: '/images/smartwatch.jpg' },
        { name: 'Laptop Stand', totalSold: 28, totalRevenue: 839.72, image: '/images/laptopstand.jpg' },
        { name: 'USB Cable', totalSold: 67, totalRevenue: 335.00, image: '/images/usbcable.jpg' },
        { name: 'Phone Case', totalSold: 23, totalRevenue: 230.00, image: '/images/phonecase.jpg' }
      ];

      const mockRevenueTrend = [
        { _id: '2024-01-01', revenue: 1250, orders: 8 },
        { _id: '2024-01-02', revenue: 1890, orders: 12 },
        { _id: '2024-01-03', revenue: 2100, orders: 15 },
        { _id: '2024-01-04', revenue: 1650, orders: 11 },
        { _id: '2024-01-05', revenue: 2300, orders: 16 },
        { _id: '2024-01-06', revenue: 1950, orders: 13 },
        { _id: '2024-01-07', revenue: 2400, orders: 17 }
      ];

      const mockLowStockItems = [
        { name: 'Wireless Mouse', quantity: 3, minStockLevel: 10, status: 'Low Stock' },
        { name: 'Keyboard', quantity: 5, minStockLevel: 15, status: 'Low Stock' },
        { name: 'Monitor', quantity: 0, minStockLevel: 5, status: 'Out of Stock' }
      ];

      res.json({
        totalOrders: 156,
        totalRevenue: 23450.75,
        avgOrderValue: 150.32,
        totalCustomers: 89,
        totalProducts: 234,
        lowStockAlerts: 3,
        lowStockItems: mockLowStockItems,
        recentOrders: mockRecentOrders,
        topProducts: mockTopProducts,
        revenueTrend: mockRevenueTrend,
        period,
        lastUpdated: new Date()
      });
    } else {
      res.json({
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        avgOrderValue: stats.avgOrderValue,
        totalCustomers,
        totalProducts,
        lowStockAlerts: lowStockItems.length,
        lowStockItems,
        recentOrders,
        topProducts,
        revenueTrend,
        period,
        lastUpdated: new Date()
      });
    }
  } catch (err) { 
    console.error('Dashboard overview error:', err);
    next(err); 
  }
};

// Get product performance and reviews
exports.getProductPerformance = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Product performance with sales and reviews
    const productPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          avgPrice: { $avg: '$items.price' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          name: '$product.name',
          category: '$product.category',
          brand: '$product.brand',
          rating: '$product.rating',
          reviewCount: '$product.reviewCount',
          totalSold: 1,
          totalRevenue: 1,
          avgPrice: 1,
          image: '$product.image',
          inStock: '$product.inStock'
        }
      },
      {
        $sort: { totalSold: -1 }
      }
    ]);

    // Product reviews summary
    const reviewsSummary = await Product.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: '$reviewCount' },
          productsWithReviews: {
            $sum: { $cond: [{ $gt: ['$reviewCount', 0] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      productPerformance,
      reviewsSummary: reviewsSummary[0] || { avgRating: 0, totalReviews: 0, productsWithReviews: 0 },
      period,
      lastUpdated: new Date()
    });
  } catch (err) { 
    console.error('Product performance error:', err);
    next(err); 
  }
};

// Get order stats and revenue trends
exports.getOrderStats = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Order statistics
    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          outForDeliveryOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'out_for_delivery'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    // Revenue trend by day
    const revenueTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Order status distribution
    const statusDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      processingOrders: 0,
      outForDeliveryOrders: 0,
      deliveredOrders: 0
    };

    res.json({
      orderStats: stats,
      revenueTrend,
      statusDistribution,
      period,
      lastUpdated: new Date()
    });
  } catch (err) { 
    console.error('Order stats error:', err);
    next(err); 
  }
};

// Get inventory and low-stock alerts
exports.getInventoryAlerts = async (req, res, next) => {
  try {
    // Low stock items
    const lowStockItems = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $match: {
          $expr: { $lte: ['$quantity', '$minStockLevel'] }
        }
      },
      {
        $project: {
          name: '$product.name',
          category: '$product.category',
          quantity: 1,
          minStockLevel: 1,
          maxStockLevel: 1,
          location: 1,
          status: {
            $cond: {
              if: { $eq: ['$quantity', 0] },
              then: 'Out of Stock',
              else: 'Low Stock'
            }
          },
          urgency: {
            $cond: {
              if: { $eq: ['$quantity', 0] },
              then: 'Critical',
              else: {
                $cond: {
                  if: { $lte: ['$quantity', { $multiply: ['$minStockLevel', 0.5] }] },
                  then: 'High',
                  else: 'Medium'
                }
              }
            }
          }
        }
      },
      {
        $sort: { urgency: 1, quantity: 1 }
      }
    ]);

    // Inventory summary
    const inventorySummary = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [
                  { $gt: ['$quantity', 0] },
                  { $lte: ['$quantity', '$minStockLevel'] }
                ]},
                1,
                0
              ]
            }
          },
          inStock: {
            $sum: {
              $cond: [
                { $gt: ['$quantity', '$minStockLevel'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Stock value by category
    const stockValueByCategory = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: '$product.category',
          totalValue: { $sum: { $multiply: ['$quantity', '$product.price'] } },
          itemCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalValue: -1 }
      }
    ]);

    const summary = inventorySummary[0] || {
      totalItems: 0,
      outOfStock: 0,
      lowStock: 0,
      inStock: 0
    };

    res.json({
      lowStockItems,
      inventorySummary: summary,
      stockValueByCategory,
      lastUpdated: new Date()
    });
  } catch (err) { 
    console.error('Inventory alerts error:', err);
    next(err); 
  }
};

// Get supplier metrics
exports.getSupplierMetrics = async (req, res, next) => {
  try {
    // Supplier performance summary
    const supplierSummary = await Supplier.aggregate([
      {
        $group: {
          _id: null,
          totalSuppliers: { $sum: 1 },
          activeSuppliers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          avgOnTimeDelivery: { $avg: '$performance.onTimeDelivery' },
          avgReliabilityScore: { $avg: '$performance.reliabilityScore' }
        }
      }
    ]);

    // Suppliers with alerts
    const suppliersWithAlerts = await Supplier.find({
      'performance.alerts.0': { $exists: true }
    }).select('name performance.alerts performance.reliabilityScore');

    // Top performing suppliers
    const topSuppliers = await Supplier.find()
      .sort({ 'performance.reliabilityScore': -1 })
      .limit(5)
      .select('name performance.reliabilityScore performance.onTimeDelivery');

    // Supplier performance distribution
    const performanceDistribution = await Supplier.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $gte: ['$performance.reliabilityScore', 90] },
              then: 'Excellent',
              else: {
                $cond: {
                  if: { $gte: ['$performance.reliabilityScore', 80] },
                  then: 'Good',
                  else: {
                    $cond: {
                      if: { $gte: ['$performance.reliabilityScore', 70] },
                      then: 'Fair',
                      else: 'Poor'
                    }
                  }
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = supplierSummary[0] || {
      totalSuppliers: 0,
      activeSuppliers: 0,
      avgOnTimeDelivery: 0,
      avgReliabilityScore: 0
    };

    res.json({
      supplierSummary: summary,
      suppliersWithAlerts,
      topSuppliers,
      performanceDistribution,
      lastUpdated: new Date()
    });
  } catch (err) { 
    console.error('Supplier metrics error:', err);
    next(err); 
  }
};

// Get category-wise sales
exports.getCategorySales = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Category sales aggregation
    const categorySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          avgPrice: { $avg: '$items.price' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    // Category performance over time
    const categoryTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: {
            category: '$product.category',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          sales: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      categorySales,
      categoryTrend,
      period,
      lastUpdated: new Date()
    });
  } catch (err) { 
    console.error('Category sales error:', err);
    next(err); 
  }
};

// Get pricing insights
exports.getPricingInsights = async (req, res, next) => {
  try {
    // Price analysis
    const priceAnalysis = await Product.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalProducts: { $sum: 1 },
          productsWithDiscount: {
            $sum: { $cond: [{ $gt: ['$discountPrice', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // Products with discounts
    const discountedProducts = await Product.find({
      discountPrice: { $gt: 0 }
    })
    .select('name price discountPrice category')
    .sort({ discountPrice: 1 })
    .limit(10);

    // Price range distribution
    const priceDistribution = await Product.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $lte: ['$price', 50] },
              then: 'Under $50',
              else: {
                $cond: {
                  if: { $lte: ['$price', 100] },
                  then: '$50-$100',
                  else: {
                    $cond: {
                      if: { $lte: ['$price', 200] },
                      then: '$100-$200',
                      else: {
                        $cond: {
                          if: { $lte: ['$price', 500] },
                          then: '$200-$500',
                          else: 'Over $500'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const analysis = priceAnalysis[0] || {
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      totalProducts: 0,
      productsWithDiscount: 0
    };

    res.json({
      priceAnalysis: analysis,
      discountedProducts,
      priceDistribution,
      lastUpdated: new Date()
    });
  } catch (err) { 
    console.error('Pricing insights error:', err);
    next(err); 
  }
};

// Get top customers
exports.getTopCustomers = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Top customers by order value
    const topCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          orderCount: 1,
          avgOrderValue: 1,
          lastOrder: 1
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Customer segments
    const customerSegments = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$total' }
        }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $gte: ['$totalSpent', 1000] },
              then: 'VIP',
              else: {
                $cond: {
                  if: { $gte: ['$totalSpent', 500] },
                  then: 'Regular',
                  else: 'Occasional'
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      topCustomers,
      customerSegments,
      period,
      lastUpdated: new Date()
    });
  } catch (err) { 
    console.error('Top customers error:', err);
    next(err); 
  }
};

// Get user feedback and comments
exports.getUserFeedback = async (req, res, next) => {
  try {
    // Recent reviews (if you have a Review model)
    // For now, we'll use product reviews
    const recentReviews = await Product.find({
      reviewCount: { $gt: 0 }
    })
    .select('name rating reviewCount')
    .sort({ reviewCount: -1 })
    .limit(10);

    // Feedback summary
    const feedbackSummary = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: '$reviewCount' },
          avgRating: { $avg: '$rating' },
          productsWithReviews: {
            $sum: { $cond: [{ $gt: ['$reviewCount', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // Rating distribution
    const ratingDistribution = await Product.aggregate([
      {
        $match: { reviewCount: { $gt: 0 } }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $gte: ['$rating', 4.5] },
              then: '5 Stars',
              else: {
                $cond: {
                  if: { $gte: ['$rating', 3.5] },
                  then: '4 Stars',
                  else: {
                    $cond: {
                      if: { $gte: ['$rating', 2.5] },
                      then: '3 Stars',
                      else: {
                        $cond: {
                          if: { $gte: ['$rating', 1.5] },
                          then: '2 Stars',
                          else: '1 Star'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = feedbackSummary[0] || {
      totalReviews: 0,
      avgRating: 0,
      productsWithReviews: 0
    };

    res.json({
      recentReviews,
      feedbackSummary: summary,
      ratingDistribution,
      lastUpdated: new Date()
    });
  } catch (err) { 
    console.error('User feedback error:', err);
    next(err); 
  }
};

// Get KPIs for different periods
exports.getKPIs = async (req, res, next) => {
  try {
    const { period = 'daily' } = req.query;
    const endDate = new Date();
    let startDate = new Date();
    let groupFormat = '%Y-%m-%d';
    
    switch (period) {
      case 'daily':
        startDate.setDate(endDate.getDate() - 7);
        groupFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        startDate.setDate(endDate.getDate() - 28);
        groupFormat = '%Y-%U';
        break;
      case 'monthly':
        startDate.setFullYear(endDate.getFullYear() - 1);
        groupFormat = '%Y-%m';
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
        groupFormat = '%Y-%m-%d';
    }

    // KPIs over time
    const kpis = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          customers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          period: '$_id',
          orders: 1,
          revenue: 1,
          avgOrderValue: 1,
          uniqueCustomers: { $size: '$customers' }
        }
      },
      {
        $sort: { period: 1 }
      }
    ]);

    // Growth calculations
    const growthMetrics = kpis.length > 1 ? {
      orderGrowth: ((kpis[kpis.length - 1].orders - kpis[kpis.length - 2].orders) / kpis[kpis.length - 2].orders * 100).toFixed(2),
      revenueGrowth: ((kpis[kpis.length - 1].revenue - kpis[kpis.length - 2].revenue) / kpis[kpis.length - 2].revenue * 100).toFixed(2)
    } : { orderGrowth: 0, revenueGrowth: 0 };

    res.json({
      kpis,
      growthMetrics,
      period,
      lastUpdated: new Date()
    });
  } catch (err) { 
    console.error('KPIs error:', err);
    next(err); 
  }
}; 