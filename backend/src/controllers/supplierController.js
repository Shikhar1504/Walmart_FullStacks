const Supplier = require('../models/Supplier');

// Get all suppliers
exports.getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) { next(err); }
};

// Create supplier (admin only)
exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) { next(err); }
};

// Update supplier (admin only)
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) { next(err); }
};

// Delete supplier (admin only)
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (err) { next(err); }
};

// Get supplier performance metrics (admin only)
exports.getPerformance = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find();
    const performance = suppliers.map(s => ({
      id: s._id,
      name: s.name,
      ...s.performance
    }));
    res.json(performance);
  } catch (err) { next(err); }
};

// Get supplier alerts (admin only)
exports.getAlerts = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ 'performance.alerts.0': { $exists: true } });
    const alerts = suppliers.map(s => ({
      id: s._id,
      name: s.name,
      alerts: s.performance.alerts
    }));
    res.json(alerts);
  } catch (err) { next(err); }
};

// Get supplier performance dashboard data
exports.getSupplierDashboard = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find();
    
    // Calculate total suppliers
    const totalSuppliers = suppliers.length;
    
    // Calculate average on-time delivery
    const onTimeDeliveries = suppliers
      .filter(s => s.performance && s.performance.onTimeDelivery)
      .map(s => s.performance.onTimeDelivery);
    const avgOnTimeDelivery = onTimeDeliveries.length > 0 
      ? Math.round((onTimeDeliveries.reduce((sum, rate) => sum + rate, 0) / onTimeDeliveries.length) * 10) / 10
      : 91.2; // Default value if no data
    
    // Calculate average reliability score
    const reliabilityScores = suppliers
      .filter(s => s.performance && s.performance.reliabilityScore)
      .map(s => s.performance.reliabilityScore);
    const avgReliabilityScore = reliabilityScores.length > 0
      ? Math.round((reliabilityScores.reduce((sum, score) => sum + score, 0) / reliabilityScores.length) * 10) / 10
      : 87.4; // Default value if no data
    
    // Calculate active alerts
    const activeAlerts = suppliers.reduce((total, supplier) => {
      if (supplier.performance && supplier.performance.alerts) {
        return total + supplier.performance.alerts.length;
      }
      return total;
    }, 0);
    
    // Get suppliers with alerts
    const suppliersWithAlerts = suppliers.filter(s => 
      s.performance && s.performance.alerts && s.performance.alerts.length > 0
    );
    
    // Calculate performance distribution
    const performanceDistribution = {
      excellent: suppliers.filter(s => s.performance && s.performance.reliabilityScore >= 90).length,
      good: suppliers.filter(s => s.performance && s.performance.reliabilityScore >= 80 && s.performance.reliabilityScore < 90).length,
      fair: suppliers.filter(s => s.performance && s.performance.reliabilityScore >= 70 && s.performance.reliabilityScore < 80).length,
      poor: suppliers.filter(s => s.performance && s.performance.reliabilityScore < 70).length
    };
    
    res.json({
      totalSuppliers,
      avgOnTimeDelivery,
      avgReliabilityScore,
      activeAlerts,
      suppliersWithAlerts: suppliersWithAlerts.map(s => ({
        id: s._id,
        name: s.name,
        alerts: s.performance.alerts,
        reliabilityScore: s.performance.reliabilityScore
      })),
      performanceDistribution,
      lastUpdated: new Date()
    });
  } catch (err) { next(err); }
};

// Get detailed supplier performance for a specific supplier
exports.getSupplierPerformance = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    const performance = supplier.performance || {};
    
    res.json({
      id: supplier._id,
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      status: supplier.status,
      rating: supplier.rating,
      lastOrder: supplier.lastOrder,
      performance: {
        onTimeDelivery: performance.onTimeDelivery || 0,
        qualityFailures: performance.qualityFailures || 0,
        contractCompliance: performance.contractCompliance || 0,
        reliabilityScore: performance.reliabilityScore || 0,
        totalDeliveries: performance.totalDeliveries || 0,
        failedInspections: performance.failedInspections || 0,
        alerts: performance.alerts || []
      }
    });
  } catch (err) { next(err); }
};

// Seed sample supplier data (for development/testing)
exports.seedSampleData = async (req, res, next) => {
  try {
    // Check if suppliers already exist
    const existingSuppliers = await Supplier.find();
    if (existingSuppliers.length > 0) {
      return res.json({ message: 'Sample data already exists', count: existingSuppliers.length });
    }

    const sampleSuppliers = [
      {
        name: 'ABC Electronics',
        contact: 'John Smith',
        email: 'john@abcelectronics.com',
        phone: '+1 (555) 123-4567',
        status: 'active',
        rating: 4.5,
        lastOrder: new Date('2024-01-15'),
        performance: {
          onTimeDelivery: 94.2,
          qualityFailures: 2.1,
          contractCompliance: 98.5,
          reliabilityScore: 92.8,
          totalDeliveries: 156,
          failedInspections: 3,
          alerts: ['Late delivery on 2024-01-10', 'Quality issue with batch #1234']
        }
      },
      {
        name: 'XYZ Manufacturing',
        contact: 'Sarah Johnson',
        email: 'sarah@xyzmanufacturing.com',
        phone: '+1 (555) 987-6543',
        status: 'active',
        rating: 4.2,
        lastOrder: new Date('2024-01-10'),
        performance: {
          onTimeDelivery: 89.7,
          qualityFailures: 4.8,
          contractCompliance: 95.2,
          reliabilityScore: 87.3,
          totalDeliveries: 203,
          failedInspections: 8,
          alerts: ['Multiple quality failures this month', 'Contract terms violation detected']
        }
      },
      {
        name: 'Global Supplies Co.',
        contact: 'Mike Wilson',
        email: 'mike@globalsupplies.com',
        phone: '+1 (555) 456-7890',
        status: 'inactive',
        rating: 3.8,
        lastOrder: new Date('2023-12-20'),
        performance: {
          onTimeDelivery: 76.3,
          qualityFailures: 8.9,
          contractCompliance: 82.1,
          reliabilityScore: 71.2,
          totalDeliveries: 89,
          failedInspections: 12,
          alerts: ['Critical: Multiple contract violations', 'Supplier under review']
        }
      },
      {
        name: 'Tech Solutions Inc.',
        contact: 'Emily Davis',
        email: 'emily@techsolutions.com',
        phone: '+1 (555) 234-5678',
        status: 'active',
        rating: 4.7,
        lastOrder: new Date('2024-01-18'),
        performance: {
          onTimeDelivery: 96.8,
          qualityFailures: 1.2,
          contractCompliance: 99.1,
          reliabilityScore: 95.4,
          totalDeliveries: 234,
          failedInspections: 2,
          alerts: []
        }
      },
      {
        name: 'Industrial Parts Ltd.',
        contact: 'David Brown',
        email: 'david@industrialparts.com',
        phone: '+1 (555) 345-6789',
        status: 'active',
        rating: 4.0,
        lastOrder: new Date('2024-01-12'),
        performance: {
          onTimeDelivery: 82.5,
          qualityFailures: 6.3,
          contractCompliance: 88.7,
          reliabilityScore: 78.9,
          totalDeliveries: 167,
          failedInspections: 15,
          alerts: ['Delivery delays affecting production', 'Quality standards need improvement']
        }
      }
    ];

    const createdSuppliers = await Supplier.insertMany(sampleSuppliers);
    res.status(201).json({ 
      message: 'Sample supplier data created successfully', 
      count: createdSuppliers.length 
    });
  } catch (err) { next(err); }
}; 