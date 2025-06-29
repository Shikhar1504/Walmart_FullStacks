"use client"

import { useState, useEffect } from "react"
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "../components/UI/Card"
import Button from "../components/UI/Button"
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
} from "recharts"
import { Filter, Calendar, TrendingUp } from "lucide-react"

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

export default function Analytics() {
  const [selectedMetric, setSelectedMetric] = useState("demand")
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
    { id: "demand", name: "Demand Forecasting", icon: TrendingUp },
    { id: "pricing", name: "Price Optimization", icon: TrendingUp },
    { id: "risk", name: "Supplier Risk Analysis", icon: TrendingUp },
  ]

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
      {selectedMetric === "demand" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Demand Forecasting</CardTitle>
              <CardDescription>AI-powered demand predictions with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filteredDemandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip formatter={(value, name, props) => {
                    if (name === 'demand') {
                      const ci = props.payload.confidenceInterval;
                      return [
                        `${value} (CI: ${ci ? `${ci[0]} - ${ci[1]}` : '±10%'})`,
                        'Predicted Demand'
                      ]
                    }
                    return [value, name]
                  }} />
                  <Line type="monotone" dataKey="demand" stroke="#10B981" strokeWidth={3} name="Predicted Demand" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Demand</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence Interval</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDemandData.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-gray-400">No forecast data available.</td>
                      </tr>
                    ) : (
                      filteredDemandData.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{item.product}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{item.demand}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-500">{item.confidenceInterval ? `${item.confidenceInterval[0]} - ${item.confidenceInterval[1]}` : '±10%'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forecast Accuracy</CardTitle>
              <CardDescription>Model performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Overall Accuracy</span>
                  <span className="text-2xl font-bold text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">MAPE</span>
                  <span className="text-lg font-semibold text-gray-900">5.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Trend Accuracy</span>
                  <span className="text-lg font-semibold text-gray-900">89.1%</span>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Model last updated: <span className="font-medium">2 hours ago</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>AI-generated insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecastInsights.length === 0 ? (
                  <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200">
                    <p className="text-sm text-gray-500">No insights available.</p>
                  </div>
                ) : (
                  forecastInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-3 bg-${insight.color}-50 rounded-lg border-l-4 border-${insight.color}-400`}
                    >
                      <p className={`text-sm text-${insight.color}-800`}>
                        <strong>{insight.title}:</strong> {insight.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedMetric === "pricing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Price Optimization Analysis</CardTitle>
              <CardDescription>Current vs optimal pricing recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={filteredPricingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="currentPrice" fill="#94A3B8" name="Current Price" />
                  <Bar dataKey="optimalPrice" fill="#3B82F6" name="Optimal Price" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Impact</CardTitle>
              <CardDescription>Potential revenue increase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">+$45,200</div>
                <p className="text-sm text-gray-600 mb-4">Monthly revenue increase potential</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price increases</span>
                    <span className="text-green-600">+$32,100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Volume optimization</span>
                    <span className="text-green-600">+$13,100</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Elasticity</CardTitle>
              <CardDescription>Demand sensitivity to price changes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart data={filteredPricingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="optimalPrice" name="Price" />
                  <YAxis dataKey="demand" name="Demand" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter dataKey="demand" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedMetric === "risk" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Supplier Risk Assessment</CardTitle>
              <CardDescription>Risk scores vs performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={filteredRiskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="riskScore" name="Risk Score" />
                  <YAxis dataKey="performance" name="Performance" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter dataKey="performance" fill="#EF4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Supplier risk categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Low Risk (0-25)</span>
                  </div>
                  <span className="text-sm text-gray-600">2 suppliers</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Medium Risk (26-50)</span>
                  </div>
                  <span className="text-sm text-gray-600">2 suppliers</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">High Risk (51+)</span>
                  </div>
                  <span className="text-sm text-gray-600">1 supplier</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Mitigation</CardTitle>
              <CardDescription>Recommended actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <p className="text-sm text-red-800">
                    <strong>High Priority:</strong> Review Supplier D contract terms
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-800">
                    <strong>Medium Priority:</strong> Diversify supplier base for Product X
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">
                    <strong>Monitor:</strong> Track delivery performance for Supplier B
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
