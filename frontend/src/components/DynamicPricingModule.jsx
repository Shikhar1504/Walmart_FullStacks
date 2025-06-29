import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './UI/Card';
import Button from './UI/Button';
import { Calculator, TrendingUp, TrendingDown, Clock, MapPin, Package, DollarSign, Info } from 'lucide-react';

// Mock Product Data
const mockProducts = [
  {
    id: 1,
    name: "Organic Bananas",
    originalPrice: 3.99,
    stock: 25,
    expiryDate: "2024-01-20", // 3 days from now
    demandCount: 45, // views/orders in last 24hrs
    areaCode: "10001",
    financialScore: 4, // affluent area
    category: "Fruits"
  },
  {
    id: 2,
    name: "Fresh Milk",
    originalPrice: 4.49,
    stock: 8, // low stock
    expiryDate: "2024-01-25", // 8 days from now
    demandCount: 120, // high demand
    areaCode: "10002",
    financialScore: 3, // middle-income area
    category: "Dairy"
  },
  {
    id: 3,
    name: "Bakery Bread",
    originalPrice: 3.99,
    stock: 5, // very low stock
    expiryDate: "2024-01-18", // 1 day from now
    demandCount: 85,
    areaCode: "10003",
    financialScore: 2, // lower-income area
    category: "Bakery"
  },
  {
    id: 4,
    name: "Premium Coffee",
    originalPrice: 12.99,
    stock: 50,
    expiryDate: "2024-02-15", // 30 days from now
    demandCount: 200, // very high demand
    areaCode: "10004",
    financialScore: 5, // very affluent area
    category: "Beverages"
  },
  {
    id: 5,
    name: "Generic Cereal",
    originalPrice: 2.99,
    stock: 15,
    expiryDate: "2024-02-10", // 25 days from now
    demandCount: 30, // low demand
    areaCode: "10005",
    financialScore: 1, // low-income area
    category: "Pantry"
  }
];

// Mock Area Data
const mockAreaData = {
  "10001": { name: "Upper East Side", financialScore: 4, avgDemand: 60 },
  "10002": { name: "Lower Manhattan", financialScore: 3, avgDemand: 80 },
  "10003": { name: "East Village", financialScore: 2, avgDemand: 70 },
  "10004": { name: "Financial District", financialScore: 5, avgDemand: 150 },
  "10005": { name: "Harlem", financialScore: 1, avgDemand: 40 }
};

// Pricing Rules Configuration
const PRICING_RULES = {
  EXPIRY_DISCOUNT: {
    enabled: true,
    daysThreshold: 7,
    discountPercentage: 20,
    description: "Expiry Date Based Discount"
  },
  DEMAND_INCREASE: {
    enabled: true,
    increasePercentage: 15,
    description: "Demand-Based Price Increase"
  },
  LOW_STOCK_INCREASE: {
    enabled: true,
    stockThreshold: 10,
    increasePercentage: 15,
    description: "Low Stock Rule"
  },
  LOCATION_ADJUSTMENT: {
    enabled: true,
    description: "Location & Economic Condition Rule"
  }
};

// Dynamic Pricing Rules Functions
const calculateExpiryDiscount = (product, rules) => {
  if (!rules.EXPIRY_DISCOUNT.enabled) return { applied: false, adjustment: 0, reason: "Rule disabled" };
  
  const today = new Date();
  const expiryDate = new Date(product.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= rules.EXPIRY_DISCOUNT.daysThreshold) {
    const discount = (product.originalPrice * rules.EXPIRY_DISCOUNT.discountPercentage) / 100;
    return {
      applied: true,
      adjustment: -discount,
      reason: `Expiring in ${daysUntilExpiry} days - ${rules.EXPIRY_DISCOUNT.discountPercentage}% discount applied`
    };
  }
  
  return { applied: false, adjustment: 0, reason: `Not expiring soon (${daysUntilExpiry} days left)` };
};

const calculateDemandIncrease = (product, rules, areaData) => {
  if (!rules.DEMAND_INCREASE.enabled) return { applied: false, adjustment: 0, reason: "Rule disabled" };
  
  const areaInfo = areaData[product.areaCode];
  const avgDemand = areaInfo ? areaInfo.avgDemand : 50;
  
  if (product.demandCount > avgDemand) {
    const increase = (product.originalPrice * rules.DEMAND_INCREASE.increasePercentage) / 100;
    return {
      applied: true,
      adjustment: increase,
      reason: `High demand (${product.demandCount} vs avg ${avgDemand}) - ${rules.DEMAND_INCREASE.increasePercentage}% increase`
    };
  }
  
  return { applied: false, adjustment: 0, reason: `Demand normal (${product.demandCount} vs avg ${avgDemand})` };
};

const calculateLowStockIncrease = (product, rules) => {
  if (!rules.LOW_STOCK_INCREASE.enabled) return { applied: false, adjustment: 0, reason: "Rule disabled" };
  
  // Check if stock is low
  if (product.stock < rules.LOW_STOCK_INCREASE.stockThreshold) {
    // Check if expiry is near (don't increase price if expiring soon)
    const today = new Date();
    const expiryDate = new Date(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry > PRICING_RULES.EXPIRY_DISCOUNT.daysThreshold) {
      const increase = (product.originalPrice * rules.LOW_STOCK_INCREASE.increasePercentage) / 100;
      return {
        applied: true,
        adjustment: increase,
        reason: `Low stock (${product.stock} units) and not expiring soon - ${rules.LOW_STOCK_INCREASE.increasePercentage}% increase`
      };
    } else {
      return { applied: false, adjustment: 0, reason: `Low stock but expiring soon (${daysUntilExpiry} days) - no increase applied` };
    }
  }
  
  return { applied: false, adjustment: 0, reason: `Stock adequate (${product.stock} units)` };
};

const calculateLocationAdjustment = (product, rules, areaData) => {
  if (!rules.LOCATION_ADJUSTMENT.enabled) return { applied: false, adjustment: 0, reason: "Rule disabled" };
  
  const areaInfo = areaData[product.areaCode];
  if (!areaInfo) return { applied: false, adjustment: 0, reason: "Area data not found" };
  
  let adjustmentPercentage = 0;
  let reason = "";
  
  // Financial score based adjustment
  if (areaInfo.financialScore >= 4) {
    adjustmentPercentage = 15 + (areaInfo.financialScore - 4) * 5; // 15-25% for affluent areas
    reason = `Affluent area (score: ${areaInfo.financialScore}) - ${adjustmentPercentage}% increase`;
  } else if (areaInfo.financialScore <= 2) {
    adjustmentPercentage = -(5 + (2 - areaInfo.financialScore) * 5); // -5 to -15% for low-income areas
    reason = `Lower-income area (score: ${areaInfo.financialScore}) - ${Math.abs(adjustmentPercentage)}% decrease`;
  } else {
    reason = `Middle-income area (score: ${areaInfo.financialScore}) - no adjustment`;
  }
  
  const adjustment = (product.originalPrice * adjustmentPercentage) / 100;
  
  return {
    applied: adjustmentPercentage !== 0,
    adjustment: adjustment,
    reason: reason
  };
};

// Main pricing calculation function
const calculateDynamicPrice = (product, rules, areaData) => {
  const adjustments = [];
  let finalPrice = product.originalPrice;
  let totalAdjustment = 0;
  
  // Apply all pricing rules
  const expiryResult = calculateExpiryDiscount(product, rules);
  const demandResult = calculateDemandIncrease(product, rules, areaData);
  const stockResult = calculateLowStockIncrease(product, rules);
  const locationResult = calculateLocationAdjustment(product, rules, areaData);
  
  // Collect all adjustments
  [expiryResult, demandResult, stockResult, locationResult].forEach(result => {
    if (result.applied) {
      adjustments.push(result);
      totalAdjustment += result.adjustment;
    }
  });
  
  // Calculate final price
  finalPrice = Math.max(0.01, product.originalPrice + totalAdjustment); // Ensure minimum price of $0.01
  
  return {
    originalPrice: product.originalPrice,
    finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimal places
    adjustments: adjustments,
    totalAdjustment: Math.round(totalAdjustment * 100) / 100,
    areaInfo: mockAreaData[product.areaCode]
  };
};

const DynamicPricingModule = () => {
  const [pricingRules, setPricingRules] = useState(PRICING_RULES);
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0]);
  const [pricingResult, setPricingResult] = useState(null);

  useEffect(() => {
    // Calculate initial pricing
    const result = calculateDynamicPrice(selectedProduct, pricingRules, mockAreaData);
    setPricingResult(result);
  }, [selectedProduct, pricingRules]);

  const toggleRule = (ruleKey) => {
    setPricingRules(prev => ({
      ...prev,
      [ruleKey]: {
        ...prev[ruleKey],
        enabled: !prev[ruleKey].enabled
      }
    }));
  };

  const getAreaInfo = (areaCode) => {
    return mockAreaData[areaCode] || { name: "Unknown Area", financialScore: 3, avgDemand: 50 };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Pricing Engine</h2>
          <p className="text-gray-600">ML-powered pricing adjustments for optimal revenue</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calculator className="w-4 h-4" />
          <span>Real-time calculations</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dynamic Pricing Module</CardTitle>
          <CardDescription>Component loaded successfully</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This component will be expanded with full dynamic pricing functionality.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicPricingModule; 