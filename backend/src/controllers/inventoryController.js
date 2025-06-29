const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

// Get all inventory
exports.getInventory = async (req, res, next) => {
  try {
    const { location } = req.query;
    const query = location ? { location } : {};
    const inventory = await Inventory.find(query).populate('productId').populate('supplier');
    res.json(inventory);
  } catch (err) { next(err); }
};

// Get inventory with product details for frontend
exports.getInventoryWithProducts = async (req, res, next) => {
  try {
    const inventory = await Inventory.find().populate('productId').populate('supplier');
    
    const inventoryWithDetails = inventory.map(item => ({
      id: item._id,
      name: item.productId?.name || 'Unknown Product',
      sku: item.productId?.sku || item.productId?._id.toString().slice(-8).toUpperCase() || 'N/A',
      category: item.productId?.category || 'Uncategorized',
      quantity: item.quantity,
      price: item.productId?.price || 0,
      status: item.status === 'expired' ? 'Expired' :
              item.quantity === 0 ? 'Out of Stock' : 
              item.quantity <= item.minStockLevel ? 'Low Stock' : 'In Stock',
      location: item.location || 'Warehouse A',
      supplier: item.supplierName || item.supplier?.name || 'Unknown Supplier',
      supplierId: item.supplier?._id,
      productId: item.productId?._id,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      expiryDate: item.expiryDate,
      batchNumber: item.batchNumber,
      purchaseDate: item.purchaseDate,
      purchasePrice: item.purchasePrice,
      lastUpdated: item.lastUpdated,
      alerts: item.alerts,
      notes: item.notes,
      isActive: item.productId?.isActive || false
    }));
    
    res.json(inventoryWithDetails);
  } catch (err) { next(err); }
};

// Create inventory item (admin only)
exports.createInventoryItem = async (req, res, next) => {
  try {
    const { 
      productId, quantity, location, minStockLevel, maxStockLevel,
      supplier, batchNumber, expiryDate, purchasePrice, notes 
    } = req.body;
    
    // Find supplier if provided
    let supplierId = null;
    let supplierName = null;
    if (supplier) {
      const supplierDoc = await Supplier.findOne({ name: supplier });
      if (supplierDoc) {
        supplierId = supplierDoc._id;
        supplierName = supplierDoc.name;
      }
    }
    
    const inventory = await Inventory.create({
      productId,
      quantity: parseInt(quantity),
      location: location || 'Warehouse A',
      minStockLevel: minStockLevel || 10,
      maxStockLevel: maxStockLevel || 100,
      supplier: supplierId,
      supplierName,
      batchNumber,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      notes
    });

    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('productId')
      .populate('supplier');
    res.status(201).json(populatedInventory);
  } catch (err) { next(err); }
};

// Create inventory item with product (admin only)
exports.createInventoryWithProduct = async (req, res, next) => {
  try {
    console.log('🔄 Creating inventory with product...');
    console.log('🔄 Request body:', req.body);
    
    const { 
      name, category, price, quantity, location, seller, 
      description, image, minStockLevel, maxStockLevel,
      expiryDate, batchNumber, purchasePrice, notes,
      weight, barcode, features, specifications
    } = req.body;

    // Validate required fields
    if (!name || !category || !price || !quantity) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, category, price, and quantity are required' 
      });
    }

    console.log('🔄 Finding or creating supplier...');
    // Find or create supplier - ensure we always have a valid supplier
    let supplier = null;
    if (seller && seller.trim()) {
      supplier = await Supplier.findOne({ name: seller.trim() });
      if (!supplier) {
        console.log('🔄 Creating new supplier:', seller.trim());
        supplier = await Supplier.create({
          name: seller.trim(),
          status: 'active'
        });
      }
    } else {
      // Create a default supplier if none provided
      console.log('🔄 Creating default supplier...');
      supplier = await Supplier.findOne({ name: 'Default Supplier' });
      if (!supplier) {
        supplier = await Supplier.create({
          name: 'Default Supplier',
          status: 'active'
        });
      }
    }

    console.log('🔄 Supplier:', supplier);

    // Ensure we have a valid supplier before creating product
    if (!supplier || !supplier._id) {
      return res.status(400).json({ 
        message: 'Failed to create or find supplier. Please provide a valid supplier name.' 
      });
    }

    console.log('🔄 Creating product...');
    // Create product first
    const productData = {
      name,
      category,
      price: parseFloat(price),
      brand: supplier.name,
      description,
      image,
      stockCount: parseInt(quantity),
      inStock: parseInt(quantity) > 0,
      supplier: supplier._id, // Now guaranteed to be valid
      supplierName: supplier.name,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      weight: weight ? parseFloat(weight) : null,
      barcode,
      features: features ? features.split(',').map(f => f.trim()) : [],
      specifications: specifications ? (() => {
        try {
          return typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
        } catch (e) {
          console.warn('Invalid specifications JSON, using empty object:', e.message);
          return {};
        }
      })() : {},
      isActive: true // Make it available on e-commerce
    };

    console.log('🔄 Product data:', productData);
    const product = await Product.create(productData);
    console.log('🔄 Product created:', product._id);

    console.log('🔄 Creating inventory item...');
    // Create inventory item
    const inventoryData = {
      productId: product._id,
      quantity: parseInt(quantity),
      location: location || 'Warehouse A',
      minStockLevel: minStockLevel || 10,
      maxStockLevel: maxStockLevel || 100,
      supplier: supplier._id,
      supplierName: supplier.name,
      batchNumber,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      notes
    };

    console.log('🔄 Inventory data:', inventoryData);
    const inventory = await Inventory.create(inventoryData);
    console.log('🔄 Inventory created:', inventory._id);

    // Return combined data
    const result = {
      id: inventory._id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      quantity: inventory.quantity,
      price: product.price,
      status: inventory.status === 'expired' ? 'Expired' :
              inventory.quantity === 0 ? 'Out of Stock' : 
              inventory.quantity <= inventory.minStockLevel ? 'Low Stock' : 'In Stock',
      location: inventory.location,
      supplier: supplier.name,
      supplierId: supplier._id,
      productId: product._id,
      minStockLevel: inventory.minStockLevel,
      maxStockLevel: inventory.maxStockLevel,
      expiryDate: inventory.expiryDate,
      batchNumber: inventory.batchNumber,
      purchaseDate: inventory.purchaseDate,
      purchasePrice: inventory.purchasePrice,
      lastUpdated: inventory.lastUpdated,
      alerts: inventory.alerts,
      notes: inventory.notes,
      isActive: product.isActive
    };

    console.log('🔄 Success! Returning result...');
    res.status(201).json(result);
  } catch (err) { 
    console.error('❌ Error creating inventory with product:', err);
    console.error('❌ Error stack:', err.stack);
    console.error('❌ Error message:', err.message);
    
    // Send more specific error messages
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate entry. This product may already exist.' 
      });
    }
    
    next(err); 
  }
};

// Update inventory item (admin only)
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const { 
      quantity, location, minStockLevel, maxStockLevel,
      supplier, batchNumber, expiryDate, purchasePrice, notes 
    } = req.body;
    
    // Find supplier if provided
    let supplierId = null;
    let supplierName = null;
    if (supplier) {
      const supplierDoc = await Supplier.findOne({ name: supplier });
      if (supplierDoc) {
        supplierId = supplierDoc._id;
        supplierName = supplierDoc.name;
      }
    }
    
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, { 
      quantity, 
      location, 
      minStockLevel, 
      maxStockLevel,
      supplier: supplierId,
      supplierName,
      batchNumber,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      notes,
      lastUpdated: Date.now() 
    }, { new: true }).populate('productId').populate('supplier');
    
    if (!inventory) return res.status(404).json({ message: 'Inventory item not found' });
    res.json(inventory);
  } catch (err) { next(err); }
};

// Delete inventory item (admin only)
exports.deleteInventoryItem = async (req, res, next) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) return res.status(404).json({ message: 'Inventory item not found' });
    res.json({ message: 'Inventory item deleted' });
  } catch (err) { next(err); }
};

// Get low stock items (admin only)
exports.getLowStockItems = async (req, res, next) => {
  try {
    const lowStock = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    }).populate('productId').populate('supplier');
    res.json(lowStock);
  } catch (err) { next(err); }
};

// Get out-of-stock items (admin only)
exports.getOutOfStockItems = async (req, res, next) => {
  try {
    const outOfStock = await Inventory.find({ quantity: 0 }).populate('productId').populate('supplier');
    res.json(outOfStock);
  } catch (err) { next(err); }
};

// Get expired items (admin only)
exports.getExpiredItems = async (req, res, next) => {
  try {
    const expired = await Inventory.find({
      expiryDate: { $lt: new Date() },
      status: { $ne: 'expired' }
    }).populate('productId').populate('supplier');
    res.json(expired);
  } catch (err) { next(err); }
};

// Get inventory dashboard data
exports.getInventoryDashboard = async (req, res, next) => {
  try {
    const inventory = await Inventory.find().populate('productId').populate('supplier');
    
    const totalItems = inventory.length;
    const inStock = inventory.filter(item => item.quantity > 0 && item.status === 'active').length;
    const lowStock = inventory.filter(item => 
      item.quantity > 0 && item.quantity <= item.minStockLevel && item.status === 'active'
    ).length;
    const outOfStock = inventory.filter(item => item.quantity === 0).length;
    const expired = inventory.filter(item => item.status === 'expired').length;
    
    // Get active products count (available on e-commerce)
    const activeProducts = await Product.countDocuments({ isActive: true });
    
    res.json({
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      expired,
      activeProducts,
      lastUpdated: new Date()
    });
  } catch (err) { next(err); }
};

// Get suppliers for dropdown and dashboard consistency
exports.getSuppliers = async (req, res, next) => {
  try {
    // Return full supplier details to match supplier dashboard
    const suppliers = await Supplier.find().select('name contact email phone status rating lastOrder performance createdAt');
    
    // Format the response to match the supplier controller format
    const formattedSuppliers = suppliers.map(supplier => ({
      id: supplier._id,
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      status: supplier.status,
      rating: supplier.rating,
      lastOrder: supplier.lastOrder,
      performance: supplier.performance || {
        onTimeDelivery: 0,
        qualityFailures: 0,
        contractCompliance: 0,
        reliabilityScore: 0,
        totalDeliveries: 0,
        failedInspections: 0,
        alerts: []
      },
      createdAt: supplier.createdAt
    }));
    
    res.json(formattedSuppliers);
  } catch (err) { next(err); }
}; 