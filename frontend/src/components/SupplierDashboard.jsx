import { Award, Brain, DollarSign, Edit, MessageSquare, Package, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from './UI/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from './UI/Card';

// Mock Supplier Data (keeping for fallback)
const mockSuppliers = [
  {
    id: 1,
    name: "ABC Electronics Corp",
    supplierId: "SUP-001",
    performanceScore: 4.2,
    qualityScore: 4.5,
    deliveryRating: 4.1,
    deliveryConsistency: 4.3,
    greenScore: 3.8,
    totalRevenue: 1250000,
    totalCost: 875000,
    comments: [
      "Excellent product quality and on-time delivery",
      "Great communication and responsive customer service",
      "Products meet all specifications consistently",
      "Some delays during peak season but overall reliable",
      "Competitive pricing and good value for money",
      "Packaging could be more eco-friendly",
      "Technical support is very helpful",
      "Would recommend to other businesses"
    ],
    deliveryMetrics: {
      onTimeDeliveries: 156,
      totalDeliveries: 180,
      averageDeliveryTime: 3.2,
      lateDeliveries: 8,
      damagedShipments: 2
    },
    lastUpdated: "2024-01-17"
  },
  {
    id: 2,
    name: "XYZ Manufacturing Ltd",
    supplierId: "SUP-002",
    performanceScore: 3.8,
    qualityScore: 4.1,
    deliveryRating: 3.9,
    deliveryConsistency: 3.7,
    greenScore: 4.2,
    totalRevenue: 890000,
    totalCost: 620000,
    comments: [
      "Good quality products but sometimes late deliveries",
      "Prices are reasonable for the quality offered",
      "Customer service needs improvement",
      "Products are durable and long-lasting",
      "Some quality issues in recent batches",
      "Delivery tracking could be better",
      "Overall satisfied with the partnership",
      "Would like to see more eco-friendly options"
    ],
    deliveryMetrics: {
      onTimeDeliveries: 89,
      totalDeliveries: 120,
      averageDeliveryTime: 4.1,
      lateDeliveries: 15,
      damagedShipments: 3
    },
    lastUpdated: "2024-01-16"
  },
  {
    id: 3,
    name: "Global Supplies Co",
    supplierId: "SUP-003",
    performanceScore: 4.6,
    qualityScore: 4.8,
    deliveryRating: 4.7,
    deliveryConsistency: 4.5,
    greenScore: 4.9,
    totalRevenue: 2100000,
    totalCost: 1450000,
    comments: [
      "Outstanding quality and reliability",
      "Best supplier we've worked with",
      "Excellent environmental practices",
      "Always delivers on time",
      "Premium products worth the price",
      "Great attention to detail",
      "Highly recommend for any business",
      "Sets the standard for excellence"
    ],
    deliveryMetrics: {
      onTimeDeliveries: 245,
      totalDeliveries: 250,
      averageDeliveryTime: 2.8,
      lateDeliveries: 2,
      damagedShipments: 0
    },
    lastUpdated: "2024-01-18"
  },
  {
    id: 4,
    name: "Metro Components Inc",
    supplierId: "SUP-004",
    performanceScore: 3.2,
    qualityScore: 3.5,
    deliveryRating: 3.1,
    deliveryConsistency: 2.9,
    greenScore: 2.8,
    totalRevenue: 450000,
    totalCost: 380000,
    comments: [
      "Frequent delivery delays",
      "Quality is inconsistent",
      "Prices are low but you get what you pay for",
      "Customer service is unresponsive",
      "Products often arrive damaged",
      "Need to improve quality control",
      "Not recommended for critical applications",
      "Looking for alternative suppliers"
    ],
    deliveryMetrics: {
      onTimeDeliveries: 45,
      totalDeliveries: 85,
      averageDeliveryTime: 5.8,
      lateDeliveries: 25,
      damagedShipments: 8
    },
    lastUpdated: "2024-01-15"
  }
];

// Modular Functions for Calculations

/**
 * Calculate overall rating from performance metrics
 * @param {Object} scores - Object containing performance scores
 * @returns {Object} - Overall rating and breakdown
 */
const calculateOverallRating = (scores) => {
  const { performanceScore, qualityScore, deliveryRating, deliveryConsistency, greenScore } = scores;
  
  // Validate input scores (0-5 range)
  const validScores = [performanceScore, qualityScore, deliveryRating, deliveryConsistency, greenScore]
    .filter(score => score >= 0 && score <= 5);
  
  if (validScores.length !== 5) {
    return {
      overallRating: 0,
      breakdown: {},
      isValid: false,
      error: "Invalid score values detected"
    };
  }
  
  const overallRating = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  
  return {
    overallRating: parseFloat(overallRating.toFixed(1)),
    breakdown: {
      performanceScore,
      qualityScore,
      deliveryRating,
      deliveryConsistency,
      greenScore
    },
    isValid: true,
    error: null
  };
};

/**
 * Get green score for environmental assessment
 * @param {Object} data - Supplier data object
 * @returns {Object} - Green score and assessment
 */
const getGreenScore = (data) => {
  const { greenScore } = data;
  
  if (greenScore < 0 || greenScore > 5) {
    return {
      score: 0,
      assessment: "Invalid",
      isValid: false,
      error: "Green score out of valid range (0-5)"
    };
  }
  
  let assessment = "";
  if (greenScore >= 4.5) assessment = "Excellent";
  else if (greenScore >= 4.0) assessment = "Very Good";
  else if (greenScore >= 3.5) assessment = "Good";
  else if (greenScore >= 3.0) assessment = "Fair";
  else if (greenScore >= 2.0) assessment = "Poor";
  else assessment = "Very Poor";
  
  return {
    score: greenScore,
    assessment,
    isValid: true,
    error: null
  };
};

/**
 * Calculate profit from revenue and cost
 * @param {number} revenue - Total revenue
 * @param {number} cost - Total cost
 * @returns {Object} - Profit calculation results
 */
const calculateProfit = (revenue, cost) => {
  if (revenue < 0 || cost < 0) {
    return {
      profit: 0,
      profitMargin: 0,
      isValid: false,
      error: "Invalid revenue or cost values"
    };
  }
  
  const profit = revenue - cost;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  
  return {
    profit: Math.round(profit),
    profitMargin: parseFloat(profitMargin.toFixed(2)),
    isValid: true,
    error: null
  };
};

/**
 * Summarize comments for display
 * @param {Array} commentList - Array of comment strings or objects
 * @returns {Object} - Comment summary statistics
 */
const summarizeComments = (commentList) => {
  if (!Array.isArray(commentList) || commentList.length === 0) {
    return {
      totalComments: 0,
      averageLength: 0,
      sentiment: "neutral",
      isValid: false,
      error: "Invalid comment list"
    };
  }
  
  const totalComments = commentList.length;
  
  // Handle both string comments and object comments
  const commentTexts = commentList.map(comment => {
    if (typeof comment === 'string') {
      return comment;
    } else if (comment && typeof comment === 'object' && comment.text) {
      return comment.text;
    } else if (comment && typeof comment === 'object' && comment.comment) {
      return comment.comment;
    }
    return '';
  }).filter(text => text.length > 0);
  
  const averageLength = commentTexts.length > 0 
    ? Math.round(commentTexts.reduce((sum, text) => sum + text.length, 0) / commentTexts.length)
    : 0;
  
  // Simple sentiment analysis based on keywords
  const positiveWords = ['excellent', 'great', 'good', 'best', 'outstanding', 'satisfied', 'recommend', 'love', 'amazing', 'perfect', 'wonderful', 'fantastic', 'liked', 'nice', 'working', 'without problems', 'happy', 'reliable', 'durable', 'quality'];
  const negativeWords = ['poor', 'bad', 'terrible', 'delays', 'issues', 'problems', 'unresponsive', 'hate', 'awful', 'worst', 'disappointed', 'broken', 'defective', 'damaged', 'useless', 'waste', 'expensive', 'overpriced', 'cheap', 'low quality', 'unreliable', 'fails', 'doesn\'t work', 'not working', 'dislike', 'horrible', 'disgusting', 'annoying', 'frustrated', 'angry', 'upset'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  commentTexts.forEach(text => {
    const lowerText = text.toLowerCase();
    let textPositiveScore = 0;
    let textNegativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) textPositiveScore++;
    });
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) textNegativeScore++;
    });
    
    // Debug logging
    console.log('🔍 Comment analysis:', {
      text: text,
      positiveScore: textPositiveScore,
      negativeScore: textNegativeScore,
      positiveMatches: positiveWords.filter(word => lowerText.includes(word)),
      negativeMatches: negativeWords.filter(word => lowerText.includes(word))
    });
    
    // Weight the sentiment based on word count
    if (textNegativeScore > textPositiveScore) {
      negativeCount++;
    } else if (textPositiveScore > textNegativeScore) {
      positiveCount++;
    }
    // If equal, check for stronger negative indicators
    else if (textNegativeScore === textPositiveScore && textNegativeScore > 0) {
      // Check for stronger negative words that indicate clear dissatisfaction
      const strongNegativeWords = ['hate', 'terrible', 'awful', 'worst', 'useless', 'broken', 'defective', 'disappointed'];
      const hasStrongNegative = strongNegativeWords.some(word => lowerText.includes(word));
      if (hasStrongNegative) {
        negativeCount++;
      } else {
        positiveCount++;
      }
    }
  });
  
  console.log('🔍 Final sentiment counts:', { positiveCount, negativeCount });
  
  let sentiment = "neutral";
  if (positiveCount > negativeCount) sentiment = "positive";
  else if (negativeCount > positiveCount) sentiment = "negative";
  // If equal counts, check if there are any negative comments at all
  else if (negativeCount === positiveCount && negativeCount > 0) {
    // If there are any negative comments, lean towards negative
    sentiment = "negative";
  }
  
  console.log('🔍 Final sentiment:', sentiment);
  
  return {
    totalComments,
    averageLength,
    sentiment,
    isValid: true,
    error: null
  };
};

/**
 * Calculate delivery performance metrics
 * @param {Object} deliveryMetrics - Delivery metrics object
 * @returns {Object} - Performance calculation results
 */
const calculateDeliveryPerformance = (deliveryMetrics) => {
  // Handle case where deliveryMetrics is undefined or null
  if (!deliveryMetrics) {
    return {
      onTimePercentage: 0,
      performanceRating: 0,
      isValid: false,
      error: "No delivery metrics available"
    };
  }
  
  const { onTimeDeliveries, totalDeliveries, averageDeliveryTime, lateDeliveries, damagedShipments } = deliveryMetrics;
  
  if (totalDeliveries <= 0) {
    return {
      onTimePercentage: 0,
      performanceRating: 0,
      isValid: false,
      error: "Invalid delivery metrics"
    };
  }
  
  const onTimePercentage = (onTimeDeliveries / totalDeliveries) * 100;
  const performanceRating = Math.min(5, (onTimePercentage / 100) * 5);
  
  return {
    onTimePercentage: parseFloat(onTimePercentage.toFixed(1)),
    performanceRating: parseFloat(performanceRating.toFixed(1)),
    isValid: true,
    error: null
  };
};

/**
 * Render star rating component
 * @param {number} rating - Rating value (0-5)
 * @returns {JSX.Element} - Star rating component
 */
const renderStarRating = (rating) => {
  const stars = [];
  // Round to nearest 0.5
  const rounded = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(rounded);
  const hasHalfStar = rounded - fullStars === 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />);
  }
  if (hasHalfStar) {
    stars.push(
      <Star
        key="half"
        className="w-4 h-4 text-yellow-400 fill-yellow-400"
        style={{ clipPath: 'inset(0 50% 0 0)' }}
      />
    );
  }
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
  }
  return <div className="flex">{stars}</div>;
};

const SupplierDashboard = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [pricingItems, setPricingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showPricingDetails, setShowPricingDetails] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [aiSummaries, setAiSummaries] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});

  // Fetch suppliers and pricing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch suppliers
        const suppliersResponse = await fetch('http://localhost:5000/api/suppliers', {
          credentials: 'include'
        });
        
        if (suppliersResponse.ok) {
          const suppliersData = await suppliersResponse.json();
          // Use suppliers data as-is without adding fake comments
          setSuppliers(suppliersData);
        } else {
          // Fallback to mock data
          setSuppliers(mockSuppliers);
        }
        
        // Fetch pricing items
        const pricingResponse = await fetch('http://localhost:5000/api/pricing/items', {
          credentials: 'include'
        });
        
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          setPricingItems(pricingData);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data
        setSuppliers(mockSuppliers);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 4.5) return 'text-green-600';
    if (performance >= 4.0) return 'text-blue-600';
    if (performance >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-orange-100 text-orange-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Group pricing items by supplier
  const pricingBySupplier = pricingItems.reduce((acc, item) => {
    if (!acc[item.supplierId]) {
      acc[item.supplierId] = [];
    }
    acc[item.supplierId].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600">Manage and monitor supplier relationships and pricing</p>
        </div>
        {/* Removed Show/Hide Pricing Details button as requested */}
      </div>

      {/* Supplier Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {suppliers.map((supplier) => {
          const profit = calculateProfit(supplier.totalRevenue, supplier.totalCost);
          const greenScore = getGreenScore(supplier);
          const deliveryPerformance = calculateDeliveryPerformance(supplier.deliveryMetrics);
          const supplierPricingItems = pricingBySupplier[supplier._id] || [];

          return (
            <Card 
              key={supplier._id || supplier.id} 
              className="transition-shadow cursor-pointer hover:shadow-lg"
              onClick={() => {
                setSelectedSupplier(supplier);
                setShowSupplierModal(true);
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <CardDescription>{supplier.supplierId}</CardDescription>
                  </div>
                  <div className="text-right">
                    {typeof supplier.overallRating === 'number' && renderStarRating(supplier.overallRating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Performance</p>
                    <p className={`font-semibold ${getPerformanceColor(supplier.performanceScore)}`}>
                      {supplier.performanceScore}/5.0
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quality</p>
                    <p className={`font-semibold ${getPerformanceColor(supplier.qualityScore)}`}>
                      {supplier.qualityScore}/5.0
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery</p>
                    <p className={`font-semibold ${getPerformanceColor(supplier.deliveryRating)}`}>
                      {supplier.deliveryRating}/5.0
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Green Score</p>
                    <p className={`font-semibold ${getPerformanceColor(supplier.greenScore)}`}>
                      {supplier.greenScore}/5.0
                    </p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="font-semibold text-green-600">
                      ${(supplier.totalRevenue / 1000).toFixed(1)}K
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profit</span>
                    <span className="font-semibold text-blue-600">
                      ${(profit.profit / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>

                {/* Pricing Items Summary */}
                {supplierPricingItems.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pricing Items</span>
                      <span className="font-semibold text-purple-600">
                        {supplierPricingItems.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. ML Score</span>
                      <span className="font-semibold text-purple-600">
                        {Math.round(supplierPricingItems.reduce((sum, item) => sum + (item.mlScore || 0), 0) / supplierPricingItems.length)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Comments Summary */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Customer Feedback</span>
                    <span className="text-xs text-gray-500">
                      {supplier.commentSummary?.totalComments || supplier.comments?.length || 0} comments
                    </span>
                  </div>
                  
                  {(() => {
                    const commentSummary = supplier.commentSummary || summarizeComments(supplier.comments || []);
                    const hasComments = (supplier.comments && supplier.comments.length > 0);
                    
                    if (!hasComments) {
                      return (
                        <div className="text-xs italic text-gray-500">
                          No customer feedback available
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Sentiment</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            commentSummary.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            commentSummary.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {commentSummary.sentiment.charAt(0).toUpperCase() + commentSummary.sentiment.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Avg. Length</span>
                          <span className="text-xs font-medium">
                            {commentSummary.averageLength} words
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSupplier(supplier);
                    }}
                    className="flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSupplier(supplier);
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pricing Items Details */}
      {showPricingDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Items by Supplier</CardTitle>
            <CardDescription>Detailed view of all pricing items with supplier information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {suppliers.map((supplier) => {
                const supplierPricingItems = pricingBySupplier[supplier._id] || [];
                
                if (supplierPricingItems.length === 0) {
                  return (
                    <div key={supplier._id || supplier.id} className="p-4 border rounded-lg">
                      <h3 className="mb-2 font-semibold text-gray-900">{supplier.name}</h3>
                      <p className="text-gray-500">No pricing items found for this supplier</p>
                    </div>
                  );
                }

                return (
                  <div key={supplier._id || supplier.id} className="p-4 border rounded-lg">
                    <h3 className="mb-4 font-semibold text-gray-900">{supplier.name}</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {supplierPricingItems.map((item) => (
                        <div key={item._id} className="p-3 transition-shadow border rounded-lg hover:shadow-md">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-500">{item.sku} • {item.category}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <p className="text-xs text-gray-600">Price</p>
                              <p className="font-semibold">${item.currentPrice}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Stock</p>
                              <p className="font-semibold">{item.stock}/{item.maxStock}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Margin</p>
                              <p className="font-semibold">{item.margin}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">ML Score</p>
                              <p className="flex items-center font-semibold">
                                <Brain className="w-3 h-3 mr-1" />
                                {item.mlScore}%
                              </p>
                            </div>
                          </div>

                          {item.isPerishable && item.expirationDate && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-600">Expires</p>
                              <p className="text-sm font-medium">
                                {new Date(item.expirationDate).toLocaleDateString()} 
                                ({item.daysUntilExpiry} days)
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${item.priceChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                              {item.priceChange}
                            </span>
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3 mr-1" />
                              Optimize
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supplier Details Modal */}
      {showSupplierModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSupplier.name}</h2>
                  <p className="text-gray-600">{selectedSupplier.supplierId}</p>
                </div>
                <button
                  onClick={() => setShowSupplierModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left Column - Performance & Financial */}
                <div className="space-y-6">
                  {/* Performance Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Performance Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 text-center rounded-lg bg-blue-50">
                          <p className="text-2xl font-bold text-blue-600">{selectedSupplier.performanceScore}</p>
                          <p className="text-sm text-gray-600">Performance Score</p>
                        </div>
                        <div className="p-3 text-center rounded-lg bg-green-50">
                          <p className="text-2xl font-bold text-green-600">{selectedSupplier.qualityScore}</p>
                          <p className="text-sm text-gray-600">Quality Score</p>
                        </div>
                        <div className="p-3 text-center rounded-lg bg-purple-50">
                          <p className="text-2xl font-bold text-purple-600">{selectedSupplier.deliveryRating}</p>
                          <p className="text-sm text-gray-600">Delivery Rating</p>
                        </div>
                        <div className="p-3 text-center rounded-lg bg-yellow-50">
                          <p className="text-2xl font-bold text-yellow-600">{selectedSupplier.greenScore}</p>
                          <p className="text-sm text-gray-600">Green Score</p>
                        </div>
                      </div>
                      
                      {/* Overall Rating */}
                      <div className="pt-4 mt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                          {typeof selectedSupplier.overallRating === 'number' ? renderStarRating(selectedSupplier.overallRating) : <span>N/A</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Financial Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const profit = calculateProfit(selectedSupplier.totalRevenue, selectedSupplier.totalCost);
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                              <span className="text-gray-700">Total Revenue</span>
                              <span className="text-xl font-bold text-green-600">
                                ${(selectedSupplier.totalRevenue / 1000).toFixed(1)}K
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                              <span className="text-gray-700">Total Cost</span>
                              <span className="text-xl font-bold text-blue-600">
                                ${(selectedSupplier.totalCost / 1000).toFixed(1)}K
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                              <span className="text-gray-700">Net Profit</span>
                              <span className="text-xl font-bold text-purple-600">
                                ${(profit.profit / 1000).toFixed(1)}K
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                              <span className="text-gray-700">Profit Margin</span>
                              <span className="text-xl font-bold text-yellow-600">
                                {typeof selectedSupplier.profitMargin === 'number' ? selectedSupplier.profitMargin + '%' : 'N/A'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Delivery Performance */}
                  {selectedSupplier.deliveryMetrics && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Package className="w-5 h-5 mr-2" />
                          Delivery Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const deliveryPerformance = calculateDeliveryPerformance(selectedSupplier.deliveryMetrics);
                          return (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">On-Time Deliveries</span>
                                <span className="font-semibold">
                                  {selectedSupplier.deliveryMetrics.onTimeDeliveries} / {selectedSupplier.deliveryMetrics.totalDeliveries}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">On-Time Percentage</span>
                                <span className="font-semibold text-green-600">
                                  {deliveryPerformance.onTimePercentage}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">Average Delivery Time</span>
                                <span className="font-semibold">
                                  {selectedSupplier.deliveryMetrics.averageDeliveryTime} days
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">Late Deliveries</span>
                                <span className="font-semibold text-red-600">
                                  {selectedSupplier.deliveryMetrics.lateDeliveries}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">Damaged Shipments</span>
                                <span className="font-semibold text-orange-600">
                                  {selectedSupplier.deliveryMetrics.damagedShipments}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column - Comments & Products */}
                <div className="space-y-6">
                  {/* Customer Comments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Customer Feedback ({selectedSupplier.commentSummary?.totalComments || selectedSupplier.comments?.length || 0} comments)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const commentSummary = selectedSupplier.commentSummary || summarizeComments(selectedSupplier.comments || []);
                        const hasComments = (selectedSupplier.comments && selectedSupplier.comments.length > 0);
                        
                        if (!hasComments) {
                          return (
                            <div className="py-8 text-center text-gray-500">
                              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-lg font-medium">No customer feedback</p>
                              <p className="text-sm">This supplier has not received any customer comments yet.</p>
                            </div>
                          );
                        }
                        
                        // Generate AI-powered summary using actual AI service
                        const generateSummary = async (comments) => {
                          if (!comments || comments.length === 0) return "No feedback available.";
                          
                          const commentTexts = comments.map(comment => comment.text || comment).filter(text => text.length > 0);
                          if (commentTexts.length === 0) return "No feedback available.";
                          
                          try {
                            // Call backend AI endpoint
                            const response = await fetch('http://localhost:5000/api/suppliers/ai-summary', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ comments: commentTexts })
                            });

                            if (response.ok) {
                              const data = await response.json();
                              return data.summary;
                            } else {
                              // Fallback to local analysis if AI service fails
                              return generateLocalSummary(commentTexts);
                            }
                          } catch (error) {
                            console.log('AI service unavailable, using local analysis');
                            // Fallback to local analysis
                            return generateLocalSummary(commentTexts);
                          }
                        };

                        // Local fallback analysis
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
                        
                        return (
                          <div className="space-y-4">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 rounded-lg bg-blue-50">
                                <p className="text-lg font-bold text-blue-600">{commentSummary.averageRating || 0}</p>
                                <p className="text-sm text-gray-600">Average Rating</p>
                              </div>
                              <div className="p-3 rounded-lg bg-green-50">
                                <p className="text-lg font-bold text-green-600">{commentSummary.averageLength}</p>
                                <p className="text-sm text-gray-600">Avg. Length (words)</p>
                              </div>
                            </div>

                            {/* Comprehensive Summary */}
                            <div className="p-4 rounded-lg bg-gray-50">
                              <h4 className="mb-2 font-medium text-gray-900">Customer Feedback Summary</h4>
                              {(() => {
                                const supplierId = selectedSupplier._id || selectedSupplier.id;
                                const isLoading = summaryLoading[supplierId];
                                const cachedSummary = aiSummaries[supplierId];
                                
                                if (isLoading) {
                                  return (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-4 h-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                      <span className="text-sm text-gray-600">AI is analyzing feedback...</span>
                                    </div>
                                  );
                                }
                                
                                if (cachedSummary) {
                                  return <p className="text-sm leading-relaxed text-gray-700">{cachedSummary}</p>;
                                }
                                
                                // Generate AI summary
                                const generateAISummary = async () => {
                                  setSummaryLoading(prev => ({ ...prev, [supplierId]: true }));
                                  try {
                                    const summary = await generateSummary(selectedSupplier.comments);
                                    setAiSummaries(prev => ({ ...prev, [supplierId]: summary }));
                                  } catch (error) {
                                    console.error('Error generating AI summary:', error);
                                  } finally {
                                    setSummaryLoading(prev => ({ ...prev, [supplierId]: false }));
                                  }
                                };
                                
                                // Start generation
                                generateAISummary();
                                
                                return (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                    <span className="text-sm text-gray-600">AI is analyzing feedback...</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Removed Supplier Products section as requested */}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 mt-6 space-x-3 border-t">
                <Button variant="outline" onClick={() => setShowSupplierModal(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowSupplierModal(false);
                  // Add contact functionality here
                }}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Supplier
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
