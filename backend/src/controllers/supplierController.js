const Supplier = require('../models/Supplier');
const Product = require('../models/Product'); // Added Product model import
const axios = require('axios'); // Use axios instead of fetch

// Simple in-memory cache for AI summaries
const aiSummaryCache = new Map();

// Get all suppliers
exports.getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find();
    
    // If no suppliers found, provide mock data
    if (suppliers.length === 0) {
      const mockSuppliers = [
        {
          _id: 'mock-supplier-1',
          name: 'Tech Supplies Inc',
          contact: 'Mike Johnson',
          email: 'mike@techsupplies.com',
          phone: '+1-555-0101',
          status: 'active',
          rating: 4.5,
          lastOrder: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          performance: {
            onTimeDelivery: 98,
            qualityFailures: 1.2,
            contractCompliance: 95,
            reliabilityScore: 95,
            totalDeliveries: 45,
            failedInspections: 1,
            alerts: []
          },
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'mock-supplier-2',
          name: 'Gadget World',
          contact: 'Sarah Chen',
          email: 'sarah@gadgetworld.com',
          phone: '+1-555-0202',
          status: 'active',
          rating: 4.2,
          lastOrder: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          performance: {
            onTimeDelivery: 92,
            qualityFailures: 3.1,
            contractCompliance: 88,
            reliabilityScore: 87,
            totalDeliveries: 38,
            failedInspections: 2,
            alerts: ['Quality issue with recent batch']
          },
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'mock-supplier-3',
          name: 'Office Supplies Co',
          contact: 'David Wilson',
          email: 'david@officesupplies.com',
          phone: '+1-555-0303',
          status: 'active',
          rating: 4.7,
          lastOrder: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          performance: {
            onTimeDelivery: 95,
            qualityFailures: 0.8,
            contractCompliance: 94,
            reliabilityScore: 92,
            totalDeliveries: 52,
            failedInspections: 0,
            alerts: []
          },
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'mock-supplier-4',
          name: 'Cable Solutions',
          contact: 'Lisa Brown',
          email: 'lisa@cablesolutions.com',
          phone: '+1-555-0404',
          status: 'active',
          rating: 4.3,
          lastOrder: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          performance: {
            onTimeDelivery: 89,
            qualityFailures: 2.5,
            contractCompliance: 91,
            reliabilityScore: 89,
            totalDeliveries: 41,
            failedInspections: 1,
            alerts: ['Late delivery last week']
          },
          createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'mock-supplier-5',
          name: 'Mobile Accessories Ltd',
          contact: 'Alex Rodriguez',
          email: 'alex@mobileaccessories.com',
          phone: '+1-555-0505',
          status: 'active',
          rating: 4.1,
          lastOrder: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          performance: {
            onTimeDelivery: 85,
            qualityFailures: 4.2,
            contractCompliance: 87,
            reliabilityScore: 84,
            totalDeliveries: 29,
            failedInspections: 3,
            alerts: ['Multiple quality issues', 'Contract compliance warning']
          },
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        }
      ];
      
      res.json(mockSuppliers);
    } else {
      // Map suppliers to include only schema-based dashboard fields
      const mappedSuppliers = await Promise.all(suppliers.map(async (supplier) => {
        const perf = supplier.performance || {};
        const totalDeliveries = perf.totalDeliveries || 0;
        const onTimeDeliveries = perf.onTimeDelivery && totalDeliveries
          ? Math.round(perf.onTimeDelivery * totalDeliveries / 100)
          : 0;
        const lateDeliveries = totalDeliveries && perf.onTimeDelivery
          ? totalDeliveries - onTimeDeliveries
          : 0;
        let qualityScore = supplier.rating ?? 0;
        if (typeof perf.qualityFailures === 'number' && totalDeliveries > 0) {
          qualityScore = Math.max(0, Math.min(5, 5 - (perf.qualityFailures / totalDeliveries) * 5));
        }
        qualityScore = Math.round(qualityScore * 100) / 100; // Round to 2 decimals
        const deliveryRating = perf.onTimeDelivery ? Math.max(0, Math.min(5, perf.onTimeDelivery / 20)) : 0;
        const deliveryConsistency = perf.contractCompliance ? Math.max(0, Math.min(5, perf.contractCompliance / 20)) : 0;
        
        // === Calculate greenScore from environmental factors ===
        let greenScore = 3.0; // Base score
        if (perf.qualityFailures <= 1) greenScore += 0.5; // Low waste
        if (perf.onTimeDelivery >= 95) greenScore += 0.3; // Efficient delivery
        if (perf.contractCompliance >= 95) greenScore += 0.2; // Good compliance
        if (perf.reliabilityScore >= 90) greenScore += 0.3; // High reliability
        if (perf.failedInspections === 0) greenScore += 0.2; // No failed inspections
        if (perf.alerts && perf.alerts.length === 0) greenScore += 0.5; // No alerts
        greenScore = Math.min(5, Math.max(0, greenScore)); // Clamp to 0-5 range
        
        // === Calculate revenue and cost from performance metrics ===
        // Base revenue calculation: more deliveries = more revenue
        const baseRevenue = totalDeliveries * 15000; // Assume 15K per delivery
        const revenueMultiplier = (perf.onTimeDelivery || 0) / 100; // Better delivery = more revenue
        const totalRevenue = Math.round(baseRevenue * (0.8 + revenueMultiplier * 0.4));
        
        // Base cost calculation: more failures = higher costs
        const baseCost = totalDeliveries * 10000; // Assume 10K base cost per delivery
        const failurePenalty = (perf.qualityFailures || 0) * 2000; // 2K penalty per failure
        const totalCost = Math.round(baseCost + failurePenalty);
        
        // === Calculate profit margin ===
        const profit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100 * 100) / 100 : 0; // Round to 2 decimals
        
        // === Calculate damaged shipments ===
        const damagedShipments = perf.failedInspections || 0;
        
        // === Calculate average delivery time (mock based on reliabilityScore) ===
        let averageDeliveryTime = 5.0; // default days
        if (perf.reliabilityScore >= 95) averageDeliveryTime = 2.5;
        else if (perf.reliabilityScore >= 90) averageDeliveryTime = 3.2;
        else if (perf.reliabilityScore >= 80) averageDeliveryTime = 4.1;
        else if (perf.reliabilityScore >= 70) averageDeliveryTime = 5.8;
        averageDeliveryTime = Math.round(averageDeliveryTime * 100) / 100;
        
        // === Calculate overall rating (average of 4 scores + greenScore) ===
        const overallRating = Math.round((( (supplier.rating ?? 0) + qualityScore + deliveryRating + deliveryConsistency + greenScore ) / 5) * 10) / 10;
        
        // === Aggregate comments from all products of this supplier ===
        const supplierProducts = await Product.find({ supplier: supplier._id });
        const allComments = [];
        let totalRating = 0;
        let commentCount = 0;
        
        supplierProducts.forEach(product => {
          if (product.comments && product.comments.length > 0) {
            product.comments.forEach(comment => {
              allComments.push({
                text: comment.comment,
                rating: comment.rating,
                userName: comment.userName,
                createdAt: comment.createdAt,
                productName: product.name
              });
              totalRating += comment.rating;
              commentCount++;
            });
          }
        });
        
        // Calculate comment summary
        const averageRating = commentCount > 0 ? Math.round((totalRating / commentCount) * 10) / 10 : 0;
        const averageLength = allComments.length > 0 
          ? Math.round(allComments.reduce((sum, comment) => sum + comment.text.length, 0) / allComments.length)
          : 0;
        
        // Simple sentiment analysis
        const positiveWords = ['excellent', 'great', 'good', 'best', 'outstanding', 'satisfied', 'recommend', 'love', 'amazing', 'perfect', 'wonderful', 'fantastic', 'liked', 'nice', 'working', 'without problems', 'happy', 'reliable', 'durable', 'quality'];
        const negativeWords = ['poor', 'bad', 'terrible', 'delays', 'issues', 'problems', 'unresponsive', 'hate', 'awful', 'worst', 'disappointed', 'broken', 'defective', 'damaged', 'useless', 'waste', 'expensive', 'overpriced', 'cheap', 'low quality', 'unreliable', 'fails', 'doesn\'t work', 'not working', 'dislike', 'horrible', 'disgusting', 'annoying', 'frustrated', 'angry', 'upset', 'return', 'defect'];
        const negationWords = ['not', 'no', 'nor', 'never', 'none', 'neither', 'doesn\'t', 'don\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t', 'haven\'t', 'hadn\'t', 'won\'t', 'wouldn\'t', 'can\'t', 'couldn\'t', 'shouldn\'t', 'mightn\'t', 'mustn\'t'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        allComments.forEach(comment => {
          const lowerText = comment.text.toLowerCase();
          let textPositiveScore = 0;
          let textNegativeScore = 0;
          
          // Check for negations first
          const hasNegation = negationWords.some(word => lowerText.includes(word));
          
          // Split text into words for better negation detection
          const words = lowerText.split(/\s+/);
          
          positiveWords.forEach(word => {
            if (lowerText.includes(word)) {
              // Check if this positive word is negated
              const wordIndex = words.findIndex(w => w.includes(word));
              if (wordIndex !== -1) {
                // Check if there's a negation word before this positive word
                const hasNegationBefore = words.slice(0, wordIndex).some(w => 
                  negationWords.some(neg => w.includes(neg))
                );
                if (!hasNegationBefore) {
                  textPositiveScore++;
                } else {
                  // Negated positive word counts as negative
                  textNegativeScore++;
                }
              } else {
                textPositiveScore++;
              }
            }
          });
          
          negativeWords.forEach(word => {
            if (lowerText.includes(word)) {
              // Check if this negative word is negated
              const wordIndex = words.findIndex(w => w.includes(word));
              if (wordIndex !== -1) {
                // Check if there's a negation word before this negative word
                const hasNegationBefore = words.slice(0, wordIndex).some(w => 
                  negationWords.some(neg => w.includes(neg))
                );
                if (!hasNegationBefore) {
                  textNegativeScore++;
                } else {
                  // Negated negative word counts as positive
                  textPositiveScore++;
                }
              } else {
                textNegativeScore++;
              }
            }
          });
          
          // Special handling for phrases that indicate problems
          if (lowerText.includes('defect') || lowerText.includes('return') || lowerText.includes('broken')) {
            textNegativeScore += 2; // Give extra weight to these strong negative indicators
          }
          
          // Weight the sentiment based on word count
          if (textNegativeScore > textPositiveScore) {
            negativeCount++;
          } else if (textPositiveScore > textNegativeScore) {
            positiveCount++;
          }
          // If equal, check for stronger negative indicators
          else if (textNegativeScore === textPositiveScore && textNegativeScore > 0) {
            // Check for stronger negative words that indicate clear dissatisfaction
            const strongNegativeWords = ['hate', 'terrible', 'awful', 'worst', 'useless', 'broken', 'defective', 'disappointed', 'return', 'defect'];
            const hasStrongNegative = strongNegativeWords.some(word => lowerText.includes(word));
            if (hasStrongNegative) {
              negativeCount++;
            } else {
              positiveCount++;
            }
          }
        });
        
        let sentiment = "neutral";
        if (positiveCount > negativeCount) sentiment = "positive";
        else if (negativeCount > positiveCount) sentiment = "negative";
        // If equal counts, check if there are any negative comments at all
        else if (negativeCount === positiveCount && negativeCount > 0) {
          // If there are any negative comments, lean towards negative
          sentiment = "negative";
        }
        
        return {
          _id: supplier._id,
          name: supplier.name,
          contact: supplier.contact,
          email: supplier.email,
          phone: supplier.phone,
          status: supplier.status,
          rating: supplier.rating,
          lastOrder: supplier.lastOrder,
          createdAt: supplier.createdAt,
          performanceScore: supplier.rating ?? 0,
          qualityScore,
          deliveryRating,
          deliveryConsistency,
          overallRating,
          greenScore: Math.round(greenScore * 10) / 10, // Round to 1 decimal
          totalRevenue,
          totalCost,
          profitMargin,
          deliveryMetrics: {
            onTimeDeliveries,
            totalDeliveries,
            lateDeliveries,
            damagedShipments,
            averageDeliveryTime
          },
          performance: {
            onTimeDelivery: perf.onTimeDelivery,
            qualityFailures: perf.qualityFailures,
            contractCompliance: perf.contractCompliance,
            reliabilityScore: perf.reliabilityScore,
            totalDeliveries: perf.totalDeliveries,
            failedInspections: perf.failedInspections,
            alerts: perf.alerts
          },
          // === Add aggregated comments data ===
          comments: allComments,
          commentSummary: {
            totalComments: allComments.length,
            averageRating,
            averageLength,
            sentiment,
            positiveCount,
            negativeCount
          }
        };
      }));
      res.json(mappedSuppliers);
    }
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

// AI Summary endpoint
exports.generateAISummary = async (req, res, next) => {
  try {
    const { comments } = req.body;
    
    console.log('🔍 AI Summary request received:', { commentCount: comments?.length });
    
    if (!comments || comments.length === 0) {
      console.log('❌ No comments provided');
      return res.json({ summary: "No feedback available." });
    }
    
    const commentTexts = comments.map(comment => comment.text || comment).filter(text => text.length > 0);
    if (commentTexts.length === 0) {
      console.log('❌ No valid comment texts found');
      return res.json({ summary: "No feedback available." });
    }
    
    // Create cache key from comment texts
    const cacheKey = commentTexts.join('|').toLowerCase();
    
    // Check cache first
    if (aiSummaryCache.has(cacheKey)) {
      console.log('✅ Returning cached AI summary');
      return res.json({ summary: aiSummaryCache.get(cacheKey), note: 'Cached result' });
    }
    
    console.log('🔍 Comment texts:', commentTexts);
    
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY && (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here')) {
      console.log('❌ No AI API key configured (GEMINI_API_KEY or OPENAI_API_KEY)');
      return res.status(500).json({ error: 'No AI API key configured' });
    }
    
    // Prepare the prompt for AI analysis
    const allComments = commentTexts.join(' | ');
    const prompt = `Analyze these customer comments and provide a simple, balanced business summary:

Comments: ${allComments}

Provide a professional summary that:
1. Accurately reflects the overall sentiment (positive, negative, or mixed)
2. Highlights both strengths and areas for improvement
3. Uses simple, clear language without markdown formatting
4. Avoids overly dramatic or extreme language
5. Focuses on constructive insights

Important: Do not use markdown formatting (no ##, **, or other formatting). Write in plain text only.

Keep it concise (2-3 sentences maximum) and professional.`;

    console.log('🔍 Calling AI API...');

    let aiSummary = '';
    
    // Try Gemini first, then OpenAI as fallback
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('🔍 Trying Gemini API...');
        console.log('🔍 Gemini API Key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
        
        const geminiResponse = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          contents: [{
            parts: [{
              text: `You are a business analyst. Provide balanced, constructive feedback analysis in plain text only (no markdown formatting). Be professional but avoid overly dramatic language. ${prompt}`
            }]
          }]
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('🔍 Gemini response status:', geminiResponse.status);

        if (geminiResponse.status === 200 && geminiResponse.data.candidates && geminiResponse.data.candidates[0]) {
          aiSummary = geminiResponse.data.candidates[0].content.parts[0].text;
          console.log('✅ Gemini AI summary generated successfully');
        } else {
          throw new Error('Invalid Gemini response structure');
        }
      } catch (geminiError) {
        console.log('⚠️ Gemini API failed:', geminiError.message);
        if (geminiError.response) {
          console.log('🔍 Gemini error details:', geminiError.response.status, geminiError.response.data);
        }
      }
    }
    
    // Fallback to OpenAI if Gemini failed or not configured
    if (!aiSummary && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      try {
        console.log('🔍 Trying OpenAI API...');
        const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a business analyst. Provide balanced, constructive feedback analysis in plain text only (no markdown formatting). Be professional but avoid overly dramatic language.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        });

        if (openaiResponse.status === 200) {
          aiSummary = openaiResponse.data.choices[0].message.content;
          console.log('✅ OpenAI AI summary generated successfully');
        }
      } catch (openaiError) {
        console.log('❌ OpenAI API also failed:', openaiError.message);
      }
    }
    
    if (aiSummary) {
      // Cache the result
      aiSummaryCache.set(cacheKey, aiSummary);
      console.log('✅ AI summary generated successfully and cached');
      res.json({ summary: aiSummary });
    } else {
      console.log('⚠️ All AI APIs failed, using local analysis');
      const localSummary = generateLocalSummary(commentTexts);
      res.json({ summary: localSummary, note: 'AI services unavailable, using local analysis' });
    }
    
  } catch (error) {
    console.error('❌ Error in AI summary generation:', error.message);
    
    // Handle specific API errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 429) {
        console.log('⚠️ Rate limit exceeded, using local analysis');
        console.log('🔍 Rate limit details:', errorData);
        // Get commentTexts from the request body for fallback
        const { comments } = req.body;
        const commentTexts = comments.map(comment => comment.text || comment).filter(text => text.length > 0);
        const localSummary = generateLocalSummary(commentTexts);
        return res.json({ summary: localSummary, note: 'AI rate limit exceeded, using local analysis' });
      } else if (status === 401) {
        console.log('❌ Invalid API key');
        return res.status(500).json({ error: 'Invalid API key' });
      } else if (status === 400) {
        console.log('❌ Bad request to AI API');
        return res.status(500).json({ error: 'Invalid request to AI service' });
      } else {
        console.log('❌ AI API error:', status, errorData);
        return res.status(500).json({ error: 'AI service error', details: errorData });
      }
    }
    
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'AI service unavailable', details: error.message });
  }
};

// Local fallback analysis function
const generateLocalSummary = (commentTexts) => {
  const totalComments = commentTexts.length;
  const avgLength = Math.round(commentTexts.reduce((sum, comment) => sum + comment.split(' ').length, 0) / totalComments);
  
  // Simple sentiment analysis
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'love', 'liked', 'nice', 'working', 'without problems', 'satisfied', 'happy', 'recommend'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'broken', 'defective', 'problem', 'issue', 'disappointed', 'waste', 'poor', 'worst'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  commentTexts.forEach(comment => {
    const lowerComment = comment.toLowerCase();
    const positiveMatches = positiveWords.filter(word => lowerComment.includes(word)).length;
    const negativeMatches = negativeWords.filter(word => lowerComment.includes(word)).length;
    
    if (positiveMatches > negativeMatches) {
      positiveCount++;
    } else if (negativeMatches > positiveMatches) {
      negativeCount++;
    }
  });
  
  if (positiveCount > negativeCount) {
    return `Customer feedback shows strong satisfaction with ${positiveCount} out of ${totalComments} positive comments. Customers appreciate the product quality and reliability, with detailed feedback averaging ${avgLength} words per comment. The supplier maintains excellent customer relationships.`;
  } else if (negativeCount > positiveCount) {
    return `Customer feedback indicates concerns with ${negativeCount} out of ${totalComments} negative comments. Areas for improvement have been identified and should be addressed to enhance customer satisfaction.`;
  } else {
    return `Customer feedback is mixed with ${positiveCount} positive and ${negativeCount} negative comments out of ${totalComments} total. While generally satisfactory, there are specific areas that could be enhanced.`;
  }
}; 