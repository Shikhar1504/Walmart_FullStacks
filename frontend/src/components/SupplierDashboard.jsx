import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './UI/Card';
import Button from './UI/Button';
import { Star, TrendingUp, TrendingDown, Package, Clock, DollarSign, Leaf, MessageSquare, Users, Award, AlertCircle, CheckCircle, Edit, Brain } from 'lucide-react';

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
  const { performanceScore, qualityScore, deliveryRating, deliveryConsistency } = scores;
  
  // Validate input scores (0-5 range)
  const validScores = [performanceScore, qualityScore, deliveryRating, deliveryConsistency]
    .filter(score => score >= 0 && score <= 5);
  
  if (validScores.length !== 4) {
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
      deliveryConsistency
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
 * @param {Array} commentList - Array of comment strings
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
  const averageLength = Math.round(
    commentList.reduce((sum, comment) => sum + comment.length, 0) / totalComments
  );
  
  // Simple sentiment analysis based on keywords
  const positiveWords = ['excellent', 'great', 'good', 'best', 'outstanding', 'satisfied', 'recommend'];
  const negativeWords = ['poor', 'bad', 'terrible', 'delays', 'issues', 'problems', 'unresponsive'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  commentList.forEach(comment => {
    const lowerComment = comment.toLowerCase();
    positiveWords.forEach(word => {
      if (lowerComment.includes(word)) positiveCount++;
    });
    negativeWords.forEach(word => {
      if (lowerComment.includes(word)) negativeCount++;
    });
  });
  
  let sentiment = "neutral";
  if (positiveCount > negativeCount) sentiment = "positive";
  else if (negativeCount > positiveCount) sentiment = "negative";
  
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
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
  }
  
  if (hasHalfStar) {
    stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
  }
  
  const emptyStars = 5 - Math.ceil(rating);
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
          // Add sample comments to suppliers that don't have them
          const suppliersWithComments = suppliersData.map(supplier => {
            if (!supplier.comments || supplier.comments.length === 0) {
              // Add sample comments based on supplier performance
              const sampleComments = [
                "Good quality products and reliable delivery",
                "Competitive pricing and good value",
                "Responsive customer service team",
                "Products meet our specifications",
                "Would recommend to other businesses",
                "Some minor delays but overall satisfied",
                "Quality is consistent across orders",
                "Good communication throughout the process"
              ];
              
              // Add some negative comments for variety (20% chance)
              if (Math.random() < 0.2) {
                sampleComments.push("Occasional delivery delays");
                sampleComments.push("Some quality issues in recent batches");
              }
              
              return {
                ...supplier,
                comments: sampleComments
              };
            }
            return supplier;
          });
          setSuppliers(suppliersWithComments);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600">Manage and monitor supplier relationships and pricing</p>
        </div>
        {/* Removed Show/Hide Pricing Details button as requested */}
      </div>

      {/* Supplier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {suppliers.map((supplier) => {
          const rating = calculateOverallRating(supplier);
          const profit = calculateProfit(supplier.totalRevenue, supplier.totalCost);
          const greenScore = getGreenScore(supplier);
          const deliveryPerformance = calculateDeliveryPerformance(supplier.deliveryMetrics);
          const supplierPricingItems = pricingBySupplier[supplier._id] || [];

          return (
            <Card 
              key={supplier._id || supplier.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedSupplier(supplier);
                setShowSupplierModal(true);
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <CardDescription>{supplier.supplierId}</CardDescription>
                  </div>
                  <div className="text-right">
                    {rating.isValid && renderStarRating(rating.overallRating)}
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
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="font-semibold text-green-600">
                      ${(supplier.totalRevenue / 1000).toFixed(1)}K
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profit</span>
                    <span className="font-semibold text-blue-600">
                      ${(profit.profit / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>

                {/* Pricing Items Summary */}
                {supplierPricingItems.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pricing Items</span>
                      <span className="font-semibold text-purple-600">
                        {supplierPricingItems.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. ML Score</span>
                      <span className="font-semibold text-purple-600">
                        {Math.round(supplierPricingItems.reduce((sum, item) => sum + (item.mlScore || 0), 0) / supplierPricingItems.length)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Comments Summary */}
                {supplier.comments && supplier.comments.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Customer Feedback</span>
                      <span className="text-xs text-gray-500">
                        {supplier.comments.length} comments
                      </span>
                    </div>
                    
                    {(() => {
                      const commentSummary = summarizeComments(supplier.comments);
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
                          
                          {/* Key Insights */}
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <p className="text-gray-700 font-medium mb-1">Key Insights:</p>
                            <ul className="text-gray-600 space-y-1">
                              {supplier.comments.slice(0, 2).map((comment, index) => (
                                <li key={index} className="truncate">
                                  "{comment.length > 50 ? comment.substring(0, 50) + '...' : comment}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

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
                    <div key={supplier._id || supplier.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{supplier.name}</h3>
                      <p className="text-gray-500">No pricing items found for this supplier</p>
                    </div>
                  );
                }

                return (
                  <div key={supplier._id || supplier.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">{supplier.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {supplierPricingItems.map((item) => (
                        <div key={item._id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
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
                              <p className="font-semibold flex items-center">
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

                          <div className="flex justify-between items-center">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{selectedSupplier.performanceScore}</p>
                          <p className="text-sm text-gray-600">Performance Score</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{selectedSupplier.qualityScore}</p>
                          <p className="text-sm text-gray-600">Quality Score</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{selectedSupplier.deliveryRating}</p>
                          <p className="text-sm text-gray-600">Delivery Rating</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-600">{selectedSupplier.greenScore}</p>
                          <p className="text-sm text-gray-600">Green Score</p>
                        </div>
                      </div>
                      
                      {/* Overall Rating */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                          {(() => {
                            const rating = calculateOverallRating(selectedSupplier);
                            return rating.isValid ? renderStarRating(rating.overallRating) : <span>N/A</span>;
                          })()}
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
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <span className="text-gray-700">Total Revenue</span>
                              <span className="text-xl font-bold text-green-600">
                                ${(selectedSupplier.totalRevenue / 1000).toFixed(1)}K
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-gray-700">Total Cost</span>
                              <span className="text-xl font-bold text-blue-600">
                                ${(selectedSupplier.totalCost / 1000).toFixed(1)}K
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                              <span className="text-gray-700">Net Profit</span>
                              <span className="text-xl font-bold text-purple-600">
                                ${(profit.profit / 1000).toFixed(1)}K
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                              <span className="text-gray-700">Profit Margin</span>
                              <span className="text-xl font-bold text-yellow-600">
                                {profit.marginPercentage}%
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
                              <div className="flex justify-between items-center">
                                <span className="text-gray-700">On-Time Deliveries</span>
                                <span className="font-semibold">
                                  {selectedSupplier.deliveryMetrics.onTimeDeliveries} / {selectedSupplier.deliveryMetrics.totalDeliveries}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-700">On-Time Percentage</span>
                                <span className="font-semibold text-green-600">
                                  {deliveryPerformance.onTimePercentage}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-700">Average Delivery Time</span>
                                <span className="font-semibold">
                                  {selectedSupplier.deliveryMetrics.averageDeliveryTime} days
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-700">Late Deliveries</span>
                                <span className="font-semibold text-red-600">
                                  {selectedSupplier.deliveryMetrics.lateDeliveries}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
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
                  {selectedSupplier.comments && selectedSupplier.comments.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Customer Feedback ({selectedSupplier.comments.length} comments)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const commentSummary = summarizeComments(selectedSupplier.comments);
                          return (
                            <div className="space-y-4">
                              {/* Sentiment Summary */}
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Overall Sentiment</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  commentSummary.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                  commentSummary.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {commentSummary.sentiment.charAt(0).toUpperCase() + commentSummary.sentiment.slice(1)}
                                </span>
                              </div>

                              {/* All Comments */}
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {selectedSupplier.comments.map((comment, index) => (
                                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700">"{comment}"</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Removed Supplier Products section as requested */}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
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
