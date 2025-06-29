"use client"

import { useState, useEffect } from "react"
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "../components/UI/Card"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { DollarSign, Package, Users, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("6m")
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    topSuppliers: 0
  })
  const [revenueData, setRevenueData] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0
  })
  const [revenueHistory, setRevenueHistory] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [supplierPerformance, setSupplierPerformance] = useState([])
  const [criticalAlerts, setCriticalAlerts] = useState({
    alerts: [],
    summary: {
      total: 0,
      high: 0,
      medium: 0,
      low: 0,
      inventory: 0,
      supplier: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [demandForecast, setDemandForecast] = useState([])

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [dashboardResponse, revenueResponse, historyResponse, categoryResponse, supplierResponse, alertsResponse, forecastResponse] = await Promise.all([
          fetch('http://localhost:5000/api/analytics/dashboard', {
            credentials: 'include'
          }),
          fetch('http://localhost:5000/api/analytics/revenue', {
            credentials: 'include'
          }),
          fetch(`http://localhost:5000/api/analytics/revenue-history?timeRange=${timeRange}`, {
            credentials: 'include'
          }),
          fetch('http://localhost:5000/api/analytics/sales-by-category', {
            credentials: 'include'
          }),
          fetch('http://localhost:5000/api/analytics/supplier-performance', {
            credentials: 'include'
          }),
          fetch('http://localhost:5000/api/analytics/critical-alerts', {
            credentials: 'include'
          }),
          fetch('http://localhost:5000/api/analytics/demand-forecast', {
            credentials: 'include'
          })
        ])

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          setDashboardData(dashboardData)
        }

        if (revenueResponse.ok) {
          const revenueData = await revenueResponse.json()
          setRevenueData(revenueData)
        }

        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          setRevenueHistory(historyData)
        }

        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json()
          setCategoryData(categoryData)
        }

        if (supplierResponse.ok) {
          const supplierData = await supplierResponse.json()
          setSupplierPerformance(supplierData)
        }

        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json()
          setCriticalAlerts(alertsData)
        }

        if (forecastResponse.ok) {
          const forecastData = await forecastResponse.json()
          setDemandForecast(forecastData.forecast || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [timeRange])

  // Function to get KPI values based on time range and real data
  const getKPIValues = (range) => {
    // Use real data from backend for current metrics
    const currentRevenue = dashboardData.totalRevenue
    const currentOrders = dashboardData.totalOrders
    
    switch (range) {
      case "1m":
        return {
          revenue: `$${(currentRevenue / 1000).toFixed(0)}k`,
          orders: currentOrders.toString(),
          suppliers: dashboardData.topSuppliers.toString(),
          alerts: criticalAlerts.summary.total.toString()
        }
      case "3m":
        return {
          revenue: `$${(currentRevenue / 1000).toFixed(0)}k`,
          orders: currentOrders.toString(),
          suppliers: dashboardData.topSuppliers.toString(),
          alerts: criticalAlerts.summary.total.toString()
        }
      case "6m":
        return {
          revenue: `$${(currentRevenue / 1000).toFixed(0)}k`,
          orders: currentOrders.toString(),
          suppliers: dashboardData.topSuppliers.toString(),
          alerts: criticalAlerts.summary.total.toString()
        }
      case "1y":
        return {
          revenue: `$${(currentRevenue / 1000).toFixed(0)}k`,
          orders: currentOrders.toString(),
          suppliers: dashboardData.topSuppliers.toString(),
          alerts: criticalAlerts.summary.total.toString()
        }
      default:
        return {
          revenue: `$${(currentRevenue / 1000).toFixed(0)}k`,
          orders: currentOrders.toString(),
          suppliers: dashboardData.topSuppliers.toString(),
          alerts: criticalAlerts.summary.total.toString()
        }
    }
  }

  const currentKPIs = getKPIValues(timeRange)

  const kpis = [
    {
      title: "Total Revenue",
      value: currentKPIs.revenue,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Orders",
      value: currentKPIs.orders,
      change: "+8.2%",
      trend: "up",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Suppliers",
      value: currentKPIs.suppliers,
      change: "+4.1%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Critical Alerts",
      value: currentKPIs.alerts,
      change: criticalAlerts.summary.high > 0 ? `+${criticalAlerts.summary.high} high` : "-15.3%",
      trend: criticalAlerts.summary.high > 0 ? "down" : "down",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your supply chain.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Time Range:</span>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)} 
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {kpi.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${kpi.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              Revenue & Profit Trends
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({timeRange === "1m" ? "Last Month" : timeRange === "3m" ? "Last 3 Months" : timeRange === "6m" ? "Last 6 Months" : "Last Year"})
              </span>
            </CardTitle>
            <CardDescription>Monthly revenue and profit over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [`$${value.toLocaleString()}`, name === "revenue" ? "Revenue" : "Profit"]}
                />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="profit" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue distribution across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${props.payload.name}: $${props.payload.revenue?.toLocaleString() || 0} (${value}%)`,
                    'Revenue'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Supplier Performance</CardTitle>
          <CardDescription>Performance metrics for your key suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplierPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => {
                  const data = props.payload;
                  if (name === "performance") {
                    return [
                      <div key="tooltip">
                        <p><strong>{data.name}</strong></p>
                        <p>Performance Score: {data.performance}%</p>
                        <p>On-Time Delivery: {data.onTime}%</p>
                        <p>Quality Score: {data.qualityScore}%</p>
                        <p>Total Orders: {data.orders}</p>
                        <p>Rating: {data.rating}/5</p>
                        <p>Alerts: {data.alerts}</p>
                        <p>Status: {data.status}</p>
                      </div>,
                      "Performance Score"
                    ];
                  }
                  return [value, name === "onTime" ? "On-Time Delivery %" : name];
                }}
              />
              <Bar dataKey="performance" fill="#3B82F6" name="Performance Score" />
              <Bar dataKey="onTime" fill="#10B981" name="On-Time Delivery %" />
              <Bar dataKey="qualityScore" fill="#F59E0B" name="Quality Score %" />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Supplier Performance Summary */}
          {supplierPerformance.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {supplierPerformance.length > 0 
                    ? Math.round(supplierPerformance.reduce((sum, s) => sum + s.performance, 0) / supplierPerformance.length)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600">Avg Performance</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {supplierPerformance.length > 0 
                    ? Math.round(supplierPerformance.reduce((sum, s) => sum + s.onTime, 0) / supplierPerformance.length)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600">Avg On-Time Delivery</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {supplierPerformance.length > 0 
                    ? Math.round(supplierPerformance.reduce((sum, s) => sum + s.qualityScore, 0) / supplierPerformance.length)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600">Avg Quality Score</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Alerts */}
      {criticalAlerts.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalAlerts.alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === "high" ? "bg-red-500" :
                      alert.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.category === 'inventory' ? 'Inventory' : 'Supplier'} • {alert.severity} priority
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} • {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New order received</p>
                <p className="text-sm text-gray-500">Order #1234 has been placed</p>
              </div>
              <span className="text-sm text-gray-500">2 min ago</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Low stock alert</p>
                <p className="text-sm text-gray-500">Product XYZ is running low</p>
              </div>
              <span className="text-sm text-gray-500">15 min ago</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Supplier update</p>
                <p className="text-sm text-gray-500">Supplier ABC has updated their delivery schedule</p>
              </div>
              <span className="text-sm text-gray-500">1 hour ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demand Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecasting</CardTitle>
          <CardDescription>AI-powered demand predictions with confidence intervals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Demand</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence Interval</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {demandForecast.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-gray-400">No forecast data available.</td>
                  </tr>
                ) : (
                  demandForecast.map((item, idx) => (
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
    </div>
  )
}
