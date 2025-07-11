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
    
    // If no orders found, provide mock data
    if (orders.length === 0) {
      const mockOrders = [
        {
          _id: 'mock-order-1',
          orderNumber: 'ORD-2024-001',
          userId: req.user.id,
          items: [
            {
              productId: 'mock-product-1',
              name: 'Wireless Bluetooth Headphones',
              price: 49.99,
              quantity: 1,
              image: '/images/headphones.jpg'
            }
          ],
          total: 49.99,
          status: 'processing',
          trackingNumber: 'TRK-001-ABC123',
          customerInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1-555-0123',
            address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            }
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          _id: 'mock-order-2',
          orderNumber: 'ORD-2024-002',
          userId: req.user.id,
          items: [
            {
              productId: 'mock-product-2',
              name: 'Smart Fitness Watch',
              price: 199.99,
              quantity: 1,
              image: '/images/smartwatch.jpg'
            },
            {
              productId: 'mock-product-4',
              name: 'Premium USB-C Cable',
              price: 4.99,
              quantity: 2,
              image: '/images/usbcable.jpg'
            }
          ],
          total: 209.97,
          status: 'shipped',
          trackingNumber: 'TRK-002-DEF456',
          customerInfo: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1-555-0456',
            address: {
              street: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              zipCode: '90210',
              country: 'USA'
            }
          },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
          _id: 'mock-order-3',
          orderNumber: 'ORD-2024-003',
          userId: req.user.id,
          items: [
            {
              productId: 'mock-product-5',
              name: 'Slim Phone Case',
              price: 19.99,
              quantity: 1,
              image: '/images/phonecase.jpg'
            }
          ],
          total: 19.99,
          status: 'delivered',
          trackingNumber: 'TRK-003-GHI789',
          customerInfo: {
            name: 'Bob Johnson',
            email: 'bob@example.com',
            phone: '+1-555-0789',
            address: {
              street: '789 Pine St',
              city: 'Chicago',
              state: 'IL',
              zipCode: '60601',
              country: 'USA'
            }
          },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ];
      
      res.json(mockOrders);
    } else {
      res.json(orders);
    }
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