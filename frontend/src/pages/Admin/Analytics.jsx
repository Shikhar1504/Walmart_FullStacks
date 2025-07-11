"use client"

import { useState, useEffect } from "react"
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "../../components/UI/Card"
import Button from "../../components/UI/Button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from "recharts"
import { Filter, Calendar, TrendingUp, Package, Users } from "lucide-react"

// Mock analytics data
const priceOptimization = [
  { product: "Product A", currentPrice: 25, optimalPrice: 28, demand: 850, margin: 15 },
  { product: "Product B", currentPrice: 45, optimalPrice: 42, demand: 620, margin: 22 },
  { product: "Product C", currentPrice: 15, optimalPrice: 18, demand: 1200, margin: 8 },
  { product: "Product D", currentPrice: 65, optimalPrice: 70, demand: 340, margin: 35 },
  { product: "Product E", currentPrice: 35, optimalPrice: 32, demand: 780, margin: 18 },
]

const supplierRisk = [
  { supplier: "Supplier A", riskScore: 15, performance: 95, orders: 45 },
  { supplier: "Supplier B", riskScore: 35, performance: 87, orders: 38 },
  { supplier: "Supplier C", riskScore: 22, performance: 92, orders: 52 },
  { supplier: "Supplier D", riskScore: 58, performance: 78, orders: 29 },
  { supplier: "Supplier E", riskScore: 28, performance: 89, orders: 41 },
]

// Add mock products for fallback
const mockProducts = [
  { _id: 'mock-product-1', name: 'Mock Product A', sku: 'MOCK-001' },
  { _id: 'mock-product-2', name: 'Mock Product B', sku: 'MOCK-002' },
  { _id: 'mock-product-3', name: 'Mock Product C', sku: 'MOCK-003' },
];

// Add mock demand forecast data for time series
const mockDemandForecast = [
  { date: '2024-01-01', price: 25.50, demand: 120, confidence: 0.85 },
  { date: '2024-01-02', price: 26.20, demand: 135, confidence: 0.87 },
  { date: '2024-01-03', price: 25.80, demand: 128, confidence: 0.84 },
  { date: '2024-01-04', price: 27.10, demand: 142, confidence: 0.89 },
  { date: '2024-01-05', price: 26.90, demand: 138, confidence: 0.86 },
  { date: '2024-01-06', price: 28.30, demand: 155, confidence: 0.92 },
  { date: '2024-01-07', price: 27.80, demand: 148, confidence: 0.88 },
  { date: '2024-01-08', price: 29.10, demand: 162, confidence: 0.91 },
  { date: '2024-01-09', price: 28.70, demand: 158, confidence: 0.89 },
  { date: '2024-01-10', price: 30.20, demand: 175, confidence: 0.94 },
  { date: '2024-01-11', price: 29.80, demand: 168, confidence: 0.90 },
  { date: '2024-01-12', price: 31.50, demand: 185, confidence: 0.93 },
  { date: '2024-01-13', price: 31.20, demand: 180, confidence: 0.91 },
  { date: '2024-01-14', price: 32.80, demand: 195, confidence: 0.95 },
  { date: '2024-01-15', price: 32.50, demand: 190, confidence: 0.93 },
  { date: '2024-01-16', price: 33.90, demand: 205, confidence: 0.96 },
  { date: '2024-01-17', price: 33.60, demand: 200, confidence: 0.94 },
  { date: '2024-01-18', price: 35.20, demand: 215, confidence: 0.97 },
  { date: '2024-01-19', price: 34.80, demand: 210, confidence: 0.95 },
  { date: '2024-01-20', price: 36.50, demand: 225, confidence: 0.98 },
  { date: '2024-01-21', price: 36.20, demand: 220, confidence: 0.96 },
  { date: '2024-01-22', price: 37.80, demand: 235, confidence: 0.99 },
  { date: '2024-01-23', price: 37.50, demand: 230, confidence: 0.97 },
  { date: '2024-01-24', price: 39.10, demand: 245, confidence: 0.98 },
  { date: '2024-01-25', price: 38.80, demand: 240, confidence: 0.96 },
  { date: '2024-01-26', price: 40.50, demand: 255, confidence: 0.99 },
  { date: '2024-01-27', price: 40.20, demand: 250, confidence: 0.97 },
  { date: '2024-01-28', price: 41.80, demand: 265, confidence: 0.98 },
  { date: '2024-01-29', price: 41.50, demand: 260, confidence: 0.96 },
  { date: '2024-01-30', price: 43.20, demand: 275, confidence: 0.99 },
  { date: '2024-01-31', price: 42.90, demand: 270, confidence: 0.97 },
];

export default function Analytics() {
  const [selectedMetric, setSelectedMetric] = useState("pricing")
  const [timeRange, setTimeRange] = useState("6m")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showDateRangeModal, setShowDateRangeModal] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  })
  const [filters, setFilters] = useState({
    category: "all",
    confidence: "all",
    riskLevel: "all",
    performance: "all"
  })

  // Supplier and Product Selection
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [pricingTimeSeries, setPricingTimeSeries] = useState([])
  const [pricingSummary, setPricingSummary] = useState({})
  const [loadingPricing, setLoadingPricing] = useState(false)

  // Demand forecast state
  const [demandForecast, setDemandForecast] = useState([])
  const [filteredDemandData, setFilteredDemandData] = useState([])

  // Filtered data based on date range
  const [filteredPricingData, setFilteredPricingData] = useState(priceOptimization)
  const [filteredRiskData, setFilteredRiskData] = useState(supplierRisk)

  const [forecastPerformance, setForecastPerformance] = useState({
    overallAccuracy: null,
    mape: null,
    trendAccuracy: null,
    lastUpdated: null
  })
  const [forecastInsights, setForecastInsights] = useState([])

  const metrics = [
    { id: "pricing", name: "Pricing Analytics", icon: TrendingUp },
    { id: "demand", name: "Demand Forecasting", icon: TrendingUp },
  ]

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/suppliers', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setSuppliers(data)
          if (data.length > 0) {
            setSelectedSupplier(data[0]._id)
          }
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error)
      }
    }
    fetchSuppliers()
  }, [])

  // Fetch products when supplier changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedSupplier) return
      
      try {
        const response = await fetch(`http://localhost:5000/api/pricing/supplier/${selectedSupplier}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
          if (data.length > 0) {
            setSelectedProduct(data[0].productId?._id || data[0]._id)
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    fetchProducts()
  }, [selectedSupplier])

  // Fetch pricing time series when product changes
  useEffect(() => {
    const fetchPricingTimeSeries = async () => {
      if (!selectedProduct) return
      
      try {
        setLoadingPricing(true)
        const response = await fetch(`http://localhost:5000/api/pricing/time-series/${selectedProduct}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setPricingTimeSeries(data.timeSeriesData || [])
          setPricingSummary(data.summary || {})
        }
      } catch (error) {
        console.error('Error fetching pricing time series:', error)
        setPricingTimeSeries([])
        setPricingSummary({})
      } finally {
        setLoadingPricing(false)
      }
    }
    fetchPricingTimeSeries()
  }, [selectedProduct])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const applyFilters = () => {
    setShowFilterModal(false)
    // Here you would typically apply the filters to your data
    // For now, we'll just close the modal
  }

  const clearFilters = () => {
    setFilters({
      category: "all",
      confidence: "all",
      riskLevel: "all",
      performance: "all"
    })
  }

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const applyDateRange = () => {
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate)
      const endDate = new Date(dateRange.endDate)
      
      // Filter demand forecast data based on date range
      const filteredDemand = demandForecast.filter(item => {
        const itemDate = new Date(item.date || `2024-${item.month}-01`)
        return itemDate >= startDate && itemDate <= endDate
      })
      
      // Filter pricing data (simulate date-based filtering)
      const filteredPricing = priceOptimization.filter((_, index) => {
        // Simulate filtering based on date range
        const simulatedDate = new Date(2024, index, 1)
        return simulatedDate >= startDate && simulatedDate <= endDate
      })
      
      // Filter risk data (simulate date-based filtering)
      const filteredRisk = supplierRisk.filter((_, index) => {
        // Simulate filtering based on date range
        const simulatedDate = new Date(2024, index, 1)
        return simulatedDate >= startDate && simulatedDate <= endDate
      })
      
      setFilteredDemandData(filteredDemand.length > 0 ? filteredDemand : demandForecast)
      setFilteredPricingData(filteredPricing.length > 0 ? filteredPricing : priceOptimization)
      setFilteredRiskData(filteredRisk.length > 0 ? filteredRisk : supplierRisk)
    } else {
      // If no date range selected, show all data
      setFilteredDemandData(demandForecast)
      setFilteredPricingData(priceOptimization)
      setFilteredRiskData(supplierRisk)
    }
    
    setShowDateRangeModal(false)
  }

  const clearDateRange = () => {
    setDateRange({
      startDate: "",
      endDate: ""
    })
    // Reset filtered data to original datasets
    setFilteredDemandData(demandForecast)
    setFilteredPricingData(priceOptimization)
    setFilteredRiskData(supplierRisk)
  }

  useEffect(() => {
    // Fetch demand forecast from backend
    const fetchDemandForecast = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/analytics/demand-forecast', {
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json()
          setDemandForecast(data.forecast || [])
          setFilteredDemandData(data.forecast || [])
          setForecastPerformance(data.performance || {})
          setForecastInsights(data.insights || [])
        }
      } catch (err) {
        setDemandForecast([])
        setFilteredDemandData([])
        setForecastPerformance({})
        setForecastInsights([])
      }
    }
    fetchDemandForecast()
  }, [])

  // Fallback for mock products and chart data
  const isMockProduct = products.length === 0 && mockProducts.some(p => p._id === selectedProduct);
  const chartData = isMockProduct ? [
    { day: 1, price: 25 },
    { day: 2, price: 26 },
    { day: 3, price: 27 },
    { day: 4, price: 28 },
    { day: 5, price: 29 },
    { day: 6, price: 28 },
    { day: 7, price: 27 },
    { day: 8, price: 26 },
    { day: 9, price: 25 },
    { day: 10, price: 24 },
  ] : pricingTimeSeries;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Advanced analytics and insights for your supply chain</p>
          {dateRange.startDate && dateRange.endDate && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Date Range:</span>
              <span className="text-sm font-medium text-blue-600">
                {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
              </span>
              <button
                onClick={clearDateRange}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowFilterModal(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={() => setShowDateRangeModal(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedMetric === metric.id ? "bg-white text-primary-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <metric.icon className="w-4 h-4 mr-2" />
            {metric.name}
          </button>
        ))}
      </div>

      {/* Analytics Content */}
      {selectedMetric === "pricing" && (
        <div className="space-y-6">
          {/* Supplier and Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Time Series Analysis</CardTitle>
              <CardDescription>Select supplier and product to analyze pricing variations over 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supplier Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Supplier</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={!selectedSupplier || (products.length === 0 && mockProducts.length === 0)}
                  >
                    <option value="">Select a product...</option>
                    {(products.length > 0 ? products : mockProducts).map((product) => (
                      <option key={product.productId?._id || product._id} value={product.productId?._id || product._id}>
                        {product.name} - {product.sku}
                      </option>
                    ))}
                  </select>
                  {/* If no products, show fallback product name instead of warning */}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Time Series Chart */}
          {selectedProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Pricing Variation Over 30 Days</CardTitle>
                  <CardDescription>How pricing changes based on expiry dates, stock levels, and market factors</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPricing ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="day" 
                          label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            `$${value}`,
                            name === 'price' ? 'Price' : name === 'stock' ? 'Stock' : name
                          ]}
                          labelFormatter={(label) => `Day ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#3B82F6" 
                          fill="#3B82F6" 
                          fillOpacity={0.3}
                          name="Price"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Summary</CardTitle>
                  <CardDescription>Key metrics for the selected product</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(pricingSummary).length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Min Price</span>
                        <span className="text-lg font-semibold text-green-600">${pricingSummary.minPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Max Price</span>
                        <span className="text-lg font-semibold text-red-600">${pricingSummary.maxPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Average Price</span>
                        <span className="text-lg font-semibold text-gray-900">${pricingSummary.avgPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Price Volatility</span>
                        <span className="text-lg font-semibold text-orange-600">{pricingSummary.priceVolatility}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                        <span className="text-lg font-semibold text-blue-600">${pricingSummary.totalRevenue}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Select a product to view pricing summary
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Pricing Table */}
              {pricingTimeSeries.length > 0 && (
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Detailed Pricing Data</CardTitle>
                    <CardDescription>Day-by-day pricing breakdown with influencing factors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Change</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factors</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pricingTimeSeries.slice(0, 10).map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{item.day}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-gray-500">{item.date}</td>
                              <td className="px-4 py-2 whitespace-nowrap font-semibold text-gray-900">${item.price}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-gray-600">{item.stock}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-gray-600">{item.demand}</td>
                              <td className={`px-4 py-2 whitespace-nowrap font-medium ${
                                item.priceChange.includes('+') ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.priceChange}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                <div className="space-y-1">
                                  {item.factors.expiryUrgency > 0 && (
                                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                      Expiry: {item.factors.expiryUrgency} days
                                    </span>
                                  )}
                                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                                    item.factors.stockUrgency === 'High' ? 'bg-red-100 text-red-800' :
                                    item.factors.stockUrgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    Stock: {item.factors.stockUrgency}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {selectedMetric === "demand" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Demand Forecasting - Price Predictions</CardTitle>
              <CardDescription>AI-powered price predictions for the upcoming month with demand forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockDemandForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'price' ? `$${value}` : value,
                      name === 'price' ? 'Predicted Price' : name === 'demand' ? 'Predicted Demand' : 'Confidence'
                    ]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    name="Predicted Price" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    name="Predicted Demand" 
                    yAxisId={1}
                  />
                  <YAxis yAxisId={1} orientation="right" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Demand</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockDemandForecast.slice(0, 10).map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap font-semibold text-green-600">
                          ${item.price}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-blue-600">
                          {item.demand}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                          {(item.confidence * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forecast Summary</CardTitle>
              <CardDescription>Key metrics for the upcoming month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Average Price</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${(mockDemandForecast.reduce((sum, item) => sum + item.price, 0) / mockDemandForecast.length).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Price Range</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${Math.min(...mockDemandForecast.map(d => d.price))} - ${Math.max(...mockDemandForecast.map(d => d.price))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Avg Demand</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {Math.round(mockDemandForecast.reduce((sum, item) => sum + item.demand, 0) / mockDemandForecast.length)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Avg Confidence</span>
                  <span className="text-lg font-semibold text-purple-600">
                    {(mockDemandForecast.reduce((sum, item) => sum + item.confidence, 0) / mockDemandForecast.length * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Forecast period: <span className="font-medium">Next 31 days</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Model accuracy: <span className="font-medium">94.2%</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>Price and demand trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="text-sm text-green-800">
                    <strong>Price Trend:</strong> Upward trend expected with 15% increase over the month
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">
                    <strong>Demand Trend:</strong> Strong demand growth with peak around mid-month
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <p className="text-sm text-purple-800">
                    <strong>Confidence:</strong> High confidence in predictions (avg 94.5%)
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-800">
                    <strong>Recommendation:</strong> Consider gradual price increases to maximize revenue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Analytics</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food & Beverage</option>
                  <option value="home">Home & Garden</option>
                </select>
              </div>

              {/* Confidence Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Level</label>
                <select
                  value={filters.confidence}
                  onChange={(e) => handleFilterChange('confidence', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="high">High (90%+)</option>
                  <option value="medium">Medium (70-89%)</option>
                  <option value="low">Low (&lt;70%)</option>
                </select>
              </div>

              {/* Risk Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                <select
                  value={filters.riskLevel}
                  onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>

              {/* Performance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Performance</label>
                <select
                  value={filters.performance}
                  onChange={(e) => handleFilterChange('performance', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Performance</option>
                  <option value="excellent">Excellent (90%+)</option>
                  <option value="good">Good (70-89%)</option>
                  <option value="poor">Poor (&lt;70%)</option>
                </select>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Modal */}
      {showDateRangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Date Range</h3>
              <button
                onClick={() => setShowDateRangeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Quick Date Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const today = new Date()
                      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                      setDateRange({
                        startDate: lastMonth.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      })
                    }}
                    className="p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date()
                      const last3Months = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
                      setDateRange({
                        startDate: last3Months.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      })
                    }}
                    className="p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Last 3 Months
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date()
                      const last6Months = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())
                      setDateRange({
                        startDate: last6Months.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      })
                    }}
                    className="p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Last 6 Months
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date()
                      const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
                      setDateRange({
                        startDate: lastYear.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      })
                    }}
                    className="p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Last Year
                  </button>
                </div>
              </div>

              {/* Date Range Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={clearDateRange}>
                  Clear
                </Button>
                <Button onClick={applyDateRange}>
                  Apply Range
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
