const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

// Create order
exports.createOrder = async (req, res, next) => {
  try {
    const { items, total, customerInfo } = req.body;
    const trackingNumber = uuidv4();
    
    console.log('🔍 Creating order with tracking number:', trackingNumber);
    console.log('📦 Order data:', { 
      items: items.length, 
      total, 
      customerInfo: customerInfo.name,
      userId: req.user.id 
    });
    
    const order = await Order.create({
      userId: req.user.id,
      items,
      total,
      customerInfo,
      trackingNumber
    });
    
    console.log('✅ Order created successfully:', {
      orderId: order._id,
      trackingNumber: order.trackingNumber,
      customerName: order.customerInfo.name
    });
    
    res.status(201).json(order);
  } catch (err) { 
    console.error('❌ Error creating order:', err);
    next(err); 
  }
};

// Get all orders (admin: all, user: own)
exports.getOrders = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

// Get order by ID (admin: any, user: own)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (err) { next(err); }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
};

// Track order by tracking number
exports.trackOrder = async (req, res, next) => {
  try {
    console.log('Tracking request received for:', req.params.trackingNumber);
    
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber });
    console.log('Database query result:', order ? 'Order found' : 'Order not found');
    
    if (!order) {
      console.log('No order found with tracking number:', req.params.trackingNumber);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Returning order:', order._id);
    res.json(order);
  } catch (err) { 
    console.error('Error in trackOrder:', err);
    next(err); 
  }
}; 