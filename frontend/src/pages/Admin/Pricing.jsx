"use client";

import { useEffect, useState } from "react";
import Button from "../../components/UI/Button";
import Card, {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/UI/Card";

import {
    AlertCircle,
    Brain,
    DollarSign,
    Edit,
    RefreshCw,
    Target,
    Thermometer,
    TrendingUp,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const Pricing = () => {
  const [activeTab, setActiveTab] = useState("perishables");
  const [pricingItems, setPricingItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    wasteReduction: 78,
    clearanceRate: 92,
    avgMLScore: 94,
    revenueSaved: 45000,
    totalPricingItems: 0,
    mlEnginePerformance: {
      wasteReduction: {
        current: 78,
        target: 80,
        status: "below",
      },
      clearanceRate: {
        current: 92,
        target: 90,
        status: "exceeded",
      },
      profitMargin: {
        current: 85,
        target: 82,
        status: "exceeded",
      },
      mlAccuracy: {
        current: 94,
        target: 90,
        status: "exceeded",
      },
    },
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [showMlSettingsModal, setShowMlSettingsModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [currentOptimizationStep, setCurrentOptimizationStep] = useState("");
  const [mlAnalytics, setMlAnalytics] = useState({
    priceFactors: {},
    timeOfDayData: [],
    mlScore: 0,
    confidence: 0,
    lastUpdated: null,
    recommendations: [],
  });
  const [mlAnalyticsLoading, setMlAnalyticsLoading] = useState(false);
  const [mlSettings, setMlSettings] = useState({
    updateFrequency: "15min",
    confidenceThreshold: 85,
    maxPriceChange: 25,
    minPriceChange: 5,
    enableAutoOptimization: true,
    enableCompetitorTracking: true,
    enableDemandForecasting: true,
    enableWasteReduction: true,
    algorithmType: "ensemble",
    dataRetentionDays: 90,
  });

  const [summaryCards, setSummaryCards] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [pricingHistory, setPricingHistory] = useState([]);

  // Helper function to get specific unique products at fixed positions
  const getSpecificUniqueProducts = (products, positions = [0, 4, 9, 14, 19]) => {
    // Get unique products by name to avoid duplicates
    const uniqueProducts = products.reduce((acc, product) => {
      const existingProduct = acc.find(p => p.name === product.name);
      if (!existingProduct) {
        acc.push(product);
      }
      return acc;
    }, []);

    // Select products at specific positions (1st, 5th, 10th, 15th, 20th)
    const selectedProducts = positions.map(index => uniqueProducts[index]).filter(Boolean);
    
    return selectedProducts;
  };

  // Mock pricing data to use if API fails
  const mockPricingItems = [
    {
      productId: "mock-1",
      name: "Organic Bananas",
      sku: "FRU-001",
      category: "Fruits",
      currentPrice: 2.99,
      originalPrice: 3.49,
      cost: 1.8,
      margin: 39.8,
      stock: 45,
      maxStock: 100,
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 3,
      demand: 85,
      clearanceRate: 92,
      wasteReduction: 78,
      mlScore: 94,
      priceFactors: {
        expirationUrgency: 85,
        stockLevel: 45,
        timeOfDay: 72,
        demandForecast: 88,
        competitorPrice: 65,
      },
      lastUpdated: new Date().toISOString(),
      priceChange: "-14.3%",
      status: "expiring_soon",
      supplierName: "Mock Supplier",
    },
    {
      productId: "mock-2",
      name: "Fresh Milk",
      sku: "DAI-001",
      category: "Dairy",
      currentPrice: 4.49,
      originalPrice: 4.99,
      cost: 2.5,
      margin: 44.3,
      stock: 28,
      maxStock: 80,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 5,
      demand: 120,
      clearanceRate: 89,
      wasteReduction: 82,
      mlScore: 91,
      priceFactors: {
        expirationUrgency: 65,
        stockLevel: 35,
        timeOfDay: 85,
        demandForecast: 92,
        competitorPrice: 78,
      },
      lastUpdated: new Date().toISOString(),
      priceChange: "-10.0%",
      status: "optimal",
      supplierName: "Mock Supplier",
    },
  ];

  const fetchPricingItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/pricing/items",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setPricingItems(data);
          // Set the first item as selected product if available
          if (!selectedProduct) {
            setSelectedProduct(data[0]);
            fetchMLAnalytics(data[0].productId);
          }
        } else {
          setPricingItems(mockPricingItems);
          if (!selectedProduct) {
            setSelectedProduct(mockPricingItems[0]);
            fetchMLAnalytics(mockPricingItems[0].productId);
          }
        }
      } else {
        setPricingItems(mockPricingItems);
        if (!selectedProduct) {
          setSelectedProduct(mockPricingItems[0]);
          fetchMLAnalytics(mockPricingItems[0].productId);
        }
      }
    } catch (error) {
      setPricingItems(mockPricingItems);
      if (!selectedProduct) {
        setSelectedProduct(mockPricingItems[0]);
        fetchMLAnalytics(mockPricingItems[0].productId);
      }
      console.error("Error fetching pricing items:", error);
    } finally {
      setLoading(false);
    }
  };


  // Fetch pricing items from database
  useEffect(() => {
  
  fetchPricingItems();
}, []);

  // Fetch suppliers for reference
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/suppliers", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setSuppliers(data);
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);


  const fetchPricingAnalytics = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/pricing/analytics",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching pricing analytics:", error);
    }
  };

  // Fetch pricing analytics
  useEffect(() => {
    

    fetchPricingAnalytics();
  }, []);

  const fetchMLAnalytics = async (productId) => {
    try {
      setMlAnalyticsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/pricing/ml-analytics/${productId}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMlAnalytics(data);
        setPricingHistory(data.pricingHistory || []); // <-- ADD THIS LINE
      }
    } catch (error) {
      console.error("Error fetching ML analytics:", error);
    } finally {
      setMlAnalyticsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  //   const handlePriceUpdate = () => {
  //     // Refresh pricing data
  //     window.location.reload()
  //   }

  const handlePriceUpdate = async () => {
    if (!selectedProduct || !newPrice) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/pricing/update/${selectedProduct.productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            price: parseFloat(newPrice),
            reason: "Manual update",
          }),
        }
      );

      if (response.ok) {
        // Optionally, show a success message
        // Refresh pricing data
        window.location.reload();
      } else {
        // Optionally, show an error message
        console.error("Failed to update price");
      }
    } catch (error) {
      console.error("Error updating price:", error);
      next(err);
    }
  };

  const handleMlSettingChange = (key, value) => {
    setMlSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveMlSettings = () => {
    // Save ML settings
    console.log("Saving ML settings...");
    setShowMlSettingsModal(false);
  };

  const resetMlSettings = () => {
    setMlSettings({
      updateFrequency: "15min",
      confidenceThreshold: 85,
      maxPriceChange: 25,
      minPriceChange: 5,
      enableAutoOptimization: true,
      enableCompetitorTracking: true,
      enableDemandForecasting: true,
      enableWasteReduction: true,
      algorithmType: "ensemble",
      dataRetentionDays: 90,
    });
  };

  const startOptimization = async () => {
    setIsOptimizing(true);
    try {
      // Start optimization for all pricing items
      //   const optimizationPromises = pricingItems.map((item) =>
      //     fetch(`http://localhost:5000/api/pricing/analytics`, {
      //       method: "GET",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       credentials: "include",
      //     })
      //   );

      await fetch(`http://localhost:5000/api/pricing/analytics`, {
        method: "GET",
        credentials: "include",
      });

      await fetchPricingItems();
      await fetchPricingAnalytics();

      // Fetch updated summary cards after optimization
      const summaryResponse = await fetch(
        "http://localhost:5000/api/pricing/summary-cards",
        {
          credentials: "include",
        }
      );
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummaryCards(summaryData);
      }

      //   await Promise.all(optimizationPromises);
      // Fetch updated analytics after optimization
      //   await fetchPricingAnalytics();
      // Optionally, refresh pricing items as well if needed
      // await fetchPricingItems()
    } catch (error) {
      console.error("Error starting optimization:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getExpiryStatus = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 0) return "text-red-600";
    if (daysUntilExpiry <= 3) return "text-yellow-600";
    return "text-green-600";
  };

  const getStockLevel = (stock, maxStock) => {
    const percentage = (stock / maxStock) * 100;
    if (percentage <= 20) return "text-red-600";
    if (percentage <= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const PerishableProductCard = ({ product }) => {
    return (
      <Card
        className="transition-shadow cursor-pointer hover:shadow-lg"
        onClick={() => {
          setSelectedProduct(product);
          fetchMLAnalytics(product.productId);
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">
                {product.sku} • {product.category}
              </p>
              <p className="text-sm text-gray-500">
                Supplier: {product.supplierName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${product.currentPrice}
              </p>
              <p
                className={`text-sm font-medium ${
                  (product.priceChange || "").startsWith("-")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {product.priceChange.startsWith("-")
                  ? "+" + product.priceChange.slice(1)
                  : "-" + product.priceChange.slice(1)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Cost</p>
              <p className="font-semibold">${product.cost}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Margin</p>
              <p className="font-semibold">{product.margin}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock</p>
              <p
                className={`font-semibold ${getStockLevel(
                  product.stock,
                  product.maxStock
                )}`}
              >
                {product.stock}/{product.maxStock}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ML Score</p>
              <p className="font-semibold">{product.mlScore}%</p>
            </div>
          </div>

          {product.isPerishable && product.expirationDate && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Expires</p>
              <p
                className={`font-semibold ${getExpiryStatus(
                  product.daysUntilExpiry
                )}`}
              >
                {new Date(product.expirationDate).toLocaleDateString()}(
                {product.daysUntilExpiry} days)
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.status === "critical"
                  ? "bg-red-100 text-red-800"
                  : product.status === "expiring_soon"
                  ? "bg-yellow-100 text-yellow-800"
                  : product.status === "optimal"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {(product.status || "").replace("_", " ")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle optimize button click
                console.log("Optimize clicked for:", product.name);
              }}
            >
              <Edit className="w-4 h-4 mr-1" />
              Optimize
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  useEffect(() => {
    fetchPricingItems();
  }, []);

  useEffect(() => {
    const fetchSummaryCards = async () => {
      try {
        setSummaryLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/pricing/summary-cards",
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSummaryCards(data);
        }
      } catch (error) {
        setSummaryCards(null);
        console.error("Error fetching summary cards:", error);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummaryCards();
  }, []);

  useEffect(() => {
    if (selectedProduct && selectedProduct.productId) {
      fetchMLAnalytics(selectedProduct.productId);
    }
  }, [selectedProduct]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dynamic Pricing Engine
          </h1>
          <p className="mt-1 text-gray-600">
            ML-powered pricing optimization for perishables and general products
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Removed ML Settings button as requested */}
          <Button onClick={startOptimization} disabled={isOptimizing}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isOptimizing ? "animate-spin" : ""}`}
            />
            {isOptimizing ? "Optimizing..." : "Run Optimization"}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1 space-x-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => handleTabChange("perishables")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "perishables"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Thermometer className="inline w-4 h-4 mr-2" />
          Perishables
        </button>
        <button
          onClick={() => handleTabChange("general")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "general"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <DollarSign className="inline w-4 h-4 mr-2" />
          General Products
        </button>
      </div>

      {activeTab === "perishables" && (
        <>
          {/* Perishables Summary Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Waste Reduction
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {loading ? "..." : `${analytics.wasteReduction}%`}
                    </p>
                  </div>
                  <Thermometer className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Clearance Rate
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {loading ? "..." : `${analytics.clearanceRate}%`}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg. ML Score
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {loading ? "..." : `${analytics.avgMLScore}%`}
                    </p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Revenue Saved
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {loading
                        ? "..."
                        : `$${(analytics.revenueSaved / 1000).toFixed(1)}K`}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ML Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>ML Engine Performance</CardTitle>
              <CardDescription>
                Real-time performance metrics and optimization results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {loading
                  ? // Loading state
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-3">
                          <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                        <div className="h-4 mb-2 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))
                  : // Real data
                    [
                      {
                        metric: "Waste Reduction",
                        data: analytics.mlEnginePerformance.wasteReduction,
                        color: "#10B981",
                      },
                      {
                        metric: "Clearance Rate",
                        data: analytics.mlEnginePerformance.clearanceRate,
                        color: "#3B82F6",
                      },
                      {
                        metric: "Profit Margin",
                        data: analytics.mlEnginePerformance.profitMargin,
                        color: "#F59E0B",
                      },
                      {
                        metric: "ML Accuracy",
                        data: analytics.mlEnginePerformance.mlAccuracy,
                        color: "#8B5CF6",
                      },
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-3">
                          <svg
                            className="w-24 h-24 transform -rotate-90"
                            viewBox="0 0 36 36"
                          >
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={item.color}
                              strokeWidth="3"
                              strokeDasharray={`${item.data.current}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-900">
                              {item.data.current}%
                            </span>
                          </div>
                        </div>
                        <h4 className="mb-1 font-medium text-gray-900">
                          {item.metric}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Target: {item.data.target}%
                        </p>
                        <div
                          className={`text-xs px-2 py-1 rounded-full mt-1 ${
                            item.data.status === "exceeded"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.data.status === "exceeded"
                            ? "Exceeded"
                            : "Below Target"}
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Perishable Products List */}
            <Card>
              <CardHeader>
                <CardTitle>Perishable Products</CardTitle>
                <CardDescription>
                  ML-optimized pricing for perishable inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getSpecificUniqueProducts(pricingItems, [0, 4, 9, 14, 19]).map((product) => (
                    <PerishableProductCard
                      key={product.productId}
                      product={product}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ML Analytics */}
            {selectedProduct && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    ML Pricing Analytics - {selectedProduct.name}
                  </CardTitle>
                  <CardDescription>
                    AI-driven pricing factors and demand forecasting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mlAnalyticsLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Price Factors */}
                      <div>
                        <h4 className="mb-4 font-medium text-gray-900">
                          ML Price Factors
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(mlAnalytics.priceFactors || {}).map(
                            ([factor, value]) => (
                              <div
                                key={factor}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm text-gray-600 capitalize">
                                  {factor
                                    .replace(/([A-Z])/g, " $1")
                                    .toLowerCase()}
                                </span>
                                {(() => {
                                  let displayValue = value;
                                  if (factor === "competitorPrice" && selectedProduct.currentPrice) {
                                    const percentRaw = (value / selectedProduct.currentPrice) * 100;
                                    displayValue = Math.max(0, Math.min(99, Math.round((percentRaw / 130) * 99)));
                                  }
                                  return (
                                    <>
                                      <div className="w-20 h-2 mr-2 bg-gray-200 rounded-full">
                                        <div
                                          className="h-2 bg-blue-600 rounded-full"
                                          style={{ width: `${displayValue}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium text-gray-900">
                                        {factor === "competitorPrice"
                                          ? `${displayValue}%`
                                          : `${value}%`}
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Time of Day Demand */}
                      <div>
                        <h4 className="mb-4 font-medium text-gray-900">
                          Time-of-Day Demand
                        </h4>
                        {/* <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={mlAnalytics.timeOfDayData || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="demand" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer> */}
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={mlAnalytics.timeOfDayData || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="demand" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* ML Score and Confidence */}
                  {!mlAnalyticsLoading && (
                    <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
                      <div className="p-4 text-center rounded-lg bg-purple-50">
                        <p className="text-2xl font-bold text-purple-600">
                          {mlAnalytics.mlScore || 0}%
                        </p>
                        <p className="text-sm text-gray-600">ML Score</p>
                      </div>
                      <div className="p-4 text-center rounded-lg bg-blue-50">
                        <p className="text-2xl font-bold text-blue-600">
                          {mlAnalytics.confidence || 0}%
                        </p>
                        <p className="text-sm text-gray-600">Confidence</p>
                      </div>
                      <div className="p-4 text-center rounded-lg bg-green-50">
                        <p className="text-sm text-gray-600">
                          Last Updated:{" "}
                          {mlAnalytics.lastUpdated
                            ? new Date(mlAnalytics.lastUpdated).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {!mlAnalyticsLoading &&
                    mlAnalytics.recommendations &&
                    mlAnalytics.recommendations.length > 0 && (
                      <div className="mt-6">
                        <h4 className="mb-3 font-medium text-gray-900">
                          AI Recommendations
                        </h4>
                        <div className="space-y-2">
                          {mlAnalytics.recommendations.map(
                            (recommendation, index) => (
                              <div
                                key={index}
                                className="p-3 border-l-4 border-yellow-400 rounded-lg bg-yellow-50"
                              >
                                <p className="text-sm text-yellow-800">
                                  {recommendation}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Product Details */}
          {selectedProduct && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Pricing Details - {selectedProduct.name}
                  </CardTitle>
                  <CardDescription>
                    ML-optimized pricing and expiration management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Current Price
                        </label>
                        <p className="text-2xl font-bold text-gray-900">
                          ${selectedProduct?.currentPrice?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Original Price
                        </label>
                        <p className="text-lg text-gray-500 line-through">
                          $
                          {selectedProduct?.originalPrice?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Days Until Expiry
                        </label>
                        <p className="text-lg font-semibold text-red-600">
                          {selectedProduct?.daysUntilExpiry || "0"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          ML Confidence
                        </label>
                        <p className="text-lg font-semibold text-purple-600">
                          {selectedProduct?.mlScore?.toFixed(1) || "0.0"}%
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => setShowPriceModal(true)}
                        className="w-full"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Override ML Price
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Waste Prevention</CardTitle>
                  <CardDescription>
                    Automated strategies to reduce food waste
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50">
                      <h4 className="mb-2 font-medium text-blue-900">
                        Clearance Strategy
                      </h4>
                      <p className="text-sm text-blue-800">
                        {selectedProduct?.clearanceRate?.toFixed(1) || "0.0"}%
                        clearance rate achieved through dynamic pricing
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50">
                      <h4 className="mb-2 font-medium text-green-900">
                        Waste Reduction
                      </h4>
                      <p className="text-sm text-green-800">
                        {selectedProduct?.wasteReduction?.toFixed(1) || "0.0"}%
                        reduction in food waste compared to static pricing
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-50">
                      <h4 className="mb-2 font-medium text-yellow-900">
                        Profit Optimization
                      </h4>
                      <p className="text-sm text-yellow-800">
                        ML algorithm maximizes profit while minimizing waste
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {activeTab === "general" && (
        <>
          {/* General Products Summary Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Price Increase
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {summaryLoading
                        ? "..."
                        : summaryCards
                        ? summaryCards.avgPriceIncrease >= 0
                          ? `-${summaryCards.avgPriceIncrease.toFixed(1)}%`
                          : `+${Math.abs(summaryCards.avgPriceIncrease).toFixed(
                              1
                            )}%`
                        : "N/A"}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Revenue Impact
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {summaryLoading
                        ? "..."
                        : summaryCards
                        ? summaryCards.revenueImpact >= 0
                          ? `-$${summaryCards.revenueImpact.toLocaleString()}`
                          : `+$${Math.abs(
                              summaryCards.revenueImpact
                            ).toLocaleString()}`
                        : "N/A"}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Products Optimized
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {summaryLoading
                        ? "..."
                        : summaryCards
                        ? summaryCards.productsOptimized
                        : "N/A"}
                    </p>
                  </div>
                  <Edit className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Price Alerts
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {summaryLoading
                        ? "..."
                        : summaryCards
                        ? summaryCards.priceAlerts
                        : "N/A"}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content for General Products */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Product List */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Select a product to view pricing details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getSpecificUniqueProducts(pricingItems, [0, 4, 9, 14, 19]).map((product) => (
                    <div
                      key={product.productId}
                      onClick={() => {
                        setSelectedProduct(product);
                        fetchMLAnalytics(product.productId);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedProduct.productId === product.productId
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600">{product.sku}</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            ${product.currentPrice?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            (product.priceChange || "").startsWith("-")
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.priceChange.startsWith("-")
                            ? "+" + product.priceChange.slice(1)
                            : "-" + product.priceChange.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Price & Demand History</CardTitle>
                <CardDescription>
                  Historical pricing data and demand correlation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pricingHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="price" orientation="left" />
                    <YAxis yAxisId="demand" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="price"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Our Price"
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="competitor"
                      stroke="#EF4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Competitor Price"
                    />
                    <Line
                      yAxisId="demand"
                      type="monotone"
                      dataKey="demand"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Demand"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Product Details for General Products */}
          {selectedProduct && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Pricing Details - {selectedProduct.name}
                  </CardTitle>
                  <CardDescription>
                    Current pricing information and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Current Price
                        </label>
                        <p className="text-2xl font-bold text-gray-900">
                          ${selectedProduct?.currentPrice?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Suggested Price
                        </label>
                        <p className="text-2xl font-bold text-green-600">
                          $
                          {selectedProduct?.suggestedPrice?.toFixed(2) ||
                            "0.00"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Current Margin
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedProduct?.margin?.toFixed(1) || "0.0"}%
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Suggested Margin
                        </label>
                        <p className="text-lg font-semibold text-green-600">
                          {selectedProduct?.suggestedMargin?.toFixed(1) ||
                            "0.0"}
                          %
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => setShowPriceModal(true)}
                        className="w-full"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Update Price
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Analysis</CardTitle>
                  <CardDescription>
                    Competitive positioning and market insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50">
                      <h4 className="mb-2 font-medium text-blue-900">
                        Price Elasticity
                      </h4>
                      <p className="text-sm text-blue-800">
                        A 10% price increase may result in 8% demand decrease
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50">
                      <h4 className="mb-2 font-medium text-green-900">
                        Competitive Position
                      </h4>
                      <p className="text-sm text-green-800">
                        Currently priced 5% below market average
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-50">
                      <h4 className="mb-2 font-medium text-yellow-900">
                        Seasonality
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Demand typically increases 15% in Q4
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Price Update Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {activeTab === "perishables"
                ? "Override ML Price"
                : "Update Price"}{" "}
              - {selectedProduct.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  New Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder={
                    activeTab === "perishables"
                      ? selectedProduct?.currentPrice?.toString() || "0"
                      : selectedProduct?.suggestedPrice?.toFixed(2) || "0.00"
                  }
                  className="input"
                />
              </div>

              {activeTab === "perishables" && (
                <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Overriding ML pricing may affect
                    waste reduction and clearance rates.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPriceModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handlePriceUpdate}>
                  {activeTab === "perishables"
                    ? "Override Price"
                    : "Update Price"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ML Settings Modal */}
      {showMlSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                ML Engine Settings
              </h3>
              <button
                onClick={() => setShowMlSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Update Frequency */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Update Frequency
                </label>
                <select
                  value={mlSettings.updateFrequency}
                  onChange={(e) =>
                    handleMlSettingChange("updateFrequency", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="5min">Every 5 minutes</option>
                  <option value="15min">Every 15 minutes</option>
                  <option value="30min">Every 30 minutes</option>
                  <option value="1hour">Every hour</option>
                  <option value="6hours">Every 6 hours</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              {/* Confidence Threshold */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Confidence Threshold: {mlSettings.confidenceThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={mlSettings.confidenceThreshold}
                  onChange={(e) =>
                    handleMlSettingChange(
                      "confidenceThreshold",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>50%</span>
                  <span>99%</span>
                </div>
              </div>

              {/* Price Change Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Max Price Change (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={mlSettings.maxPriceChange}
                    onChange={(e) =>
                      handleMlSettingChange(
                        "maxPriceChange",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Min Price Change (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={mlSettings.minPriceChange}
                    onChange={(e) =>
                      handleMlSettingChange(
                        "minPriceChange",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Algorithm Type */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Algorithm Type
                </label>
                <select
                  value={mlSettings.algorithmType}
                  onChange={(e) =>
                    handleMlSettingChange("algorithmType", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ensemble">Ensemble (Recommended)</option>
                  <option value="neural_network">Neural Network</option>
                  <option value="random_forest">Random Forest</option>
                  <option value="gradient_boosting">Gradient Boosting</option>
                  <option value="linear_regression">Linear Regression</option>
                </select>
              </div>

              {/* Data Retention */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Data Retention (Days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={mlSettings.dataRetentionDays}
                  onChange={(e) =>
                    handleMlSettingChange(
                      "dataRetentionDays",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Feature Toggles */}
              <div>
                <label className="block mb-3 text-sm font-medium text-gray-700">
                  Feature Toggles
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Auto Optimization
                      </p>
                      <p className="text-xs text-gray-500">
                        Automatically apply ML price recommendations
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mlSettings.enableAutoOptimization}
                        onChange={(e) =>
                          handleMlSettingChange(
                            "enableAutoOptimization",
                            e.target.checked
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Competitor Tracking
                      </p>
                      <p className="text-xs text-gray-500">
                        Monitor competitor prices for optimization
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mlSettings.enableCompetitorTracking}
                        onChange={(e) =>
                          handleMlSettingChange(
                            "enableCompetitorTracking",
                            e.target.checked
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Demand Forecasting
                      </p>
                      <p className="text-xs text-gray-500">
                        Use demand predictions for pricing
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mlSettings.enableDemandForecasting}
                        onChange={(e) =>
                          handleMlSettingChange(
                            "enableDemandForecasting",
                            e.target.checked
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Waste Reduction
                      </p>
                      <p className="text-xs text-gray-500">
                        Optimize for waste reduction (perishables)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mlSettings.enableWasteReduction}
                        onChange={(e) =>
                          handleMlSettingChange(
                            "enableWasteReduction",
                            e.target.checked
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 space-x-3 border-t">
                <Button variant="outline" onClick={resetMlSettings}>
                  Reset to Defaults
                </Button>
                <Button onClick={saveMlSettings}>Save Settings</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Progress Modal */}
      {showOptimizationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <div className="text-center">
              <div className="mb-4">
                <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Running ML Optimization
              </h3>

              <p className="mb-4 text-sm text-gray-600">
                {currentOptimizationStep || "Analyzing market data..."}
              </p>

              {/* Progress Bar */}
              <div className="w-full h-2 mb-4 bg-gray-200 rounded-full">
                <div
                  className="h-2 transition-all duration-500 ease-out bg-blue-600 rounded-full"
                  style={{ width: `${optimizationProgress}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-500">
                {Math.round(optimizationProgress)}% Complete
              </p>

              {optimizationProgress === 100 && (
                <div className="p-3 mt-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm font-medium text-green-800">
                      Optimization completed successfully!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
