import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import SupplierDashboard from '../components/SupplierDashboard';
import { Award, Calculator } from 'lucide-react';

const Suppliers = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [activeTab, setActiveTab] = useState("performance");
  
  // Supplier dashboard state
  const [supplierDashboard, setSupplierDashboard] = useState({
    totalSuppliers: 0,
    avgOnTimeDelivery: 0,
    avgReliabilityScore: 0,
    activeAlerts: 0,
    suppliersWithAlerts: [],
    performanceDistribution: {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0
    },
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);

  // Real suppliers state
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  // Fetch supplier dashboard data from backend
  useEffect(() => {
    const fetchSupplierDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/suppliers/dashboard', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setSupplierDashboard(data);
        }
      } catch (error) {
        console.error('Error fetching supplier dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDashboard();
  }, []);

  // Fetch suppliers list from backend
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setSuppliersLoading(true);
        const response = await fetch('http://localhost:5000/api/suppliers', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setSuppliers(data);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setSuppliersLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const getReliabilityColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReliabilityBgColor = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getAlertSeverity = (alert) => {
    if (alert.includes('Critical:')) return 'text-red-600 bg-red-50 border-red-200';
    if (alert.includes('Multiple')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const PerformanceModal = ({ supplier, onClose }) => {
    if (!supplier) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Performance Analytics - {supplier.name}
            </h2>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">On-Time Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {supplier.performance.onTimeDelivery}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${supplier.performance.onTimeDelivery}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {supplier.performance.totalDeliveries} total deliveries
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Check Failures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {supplier.performance.qualityFailures}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${supplier.performance.qualityFailures}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {supplier.performance.failedInspections} failed inspections
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contract Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {supplier.performance.contractCompliance}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${supplier.performance.contractCompliance}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Terms adherence
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reliability Score */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Overall Reliability Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-5xl font-bold mb-4 ${getReliabilityColor(supplier.performance.reliabilityScore)}`}>
                  {supplier.performance.reliabilityScore}
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getReliabilityBgColor(supplier.performance.reliabilityScore)} ${getReliabilityColor(supplier.performance.reliabilityScore)}`}>
                  {supplier.performance.reliabilityScore >= 90 ? 'Excellent' : 
                   supplier.performance.reliabilityScore >= 80 ? 'Good' : 
                   supplier.performance.reliabilityScore >= 70 ? 'Fair' : 'Poor'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Active Alerts & Anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.performance.alerts.length > 0 ? (
                <div className="space-y-3">
                  {supplier.performance.alerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getAlertSeverity(alert)}`}>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{alert}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No active alerts</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Supplier Performance Dashboard</h1>
        <p className="text-gray-600 mt-2">Automated monitoring and analytics for supplier performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab("performance")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "performance"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Award className="w-4 h-4 inline mr-2" />
          Performance Monitoring
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "dashboard"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Calculator className="w-4 h-4 inline mr-2" />
          Supplier Dashboard
        </button>
      </div>

      {activeTab === "performance" && (
        <div className="grid gap-6">
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : supplierDashboard.totalSuppliers}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. On-Time Delivery</p>
                    <p className="text-2xl font-bold text-green-600">
                      {loading ? '...' : `${supplierDashboard.avgOnTimeDelivery}%`}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Reliability Score</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {loading ? '...' : supplierDashboard.avgReliabilityScore}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-red-600">
                      {loading ? '...' : supplierDashboard.activeAlerts}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Analytics Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">On-Time Delivery Trends</h3>
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Chart: Delivery Performance</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Metrics</h3>
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Chart: Quality Trends</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance Tracking</h3>
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Chart: Compliance Status</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Suppliers Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Supplier Performance Monitoring</CardTitle>
                <Button>Add New Supplier</Button>
              </div>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border-b border-gray-100">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/6"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Supplier</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">On-Time Delivery</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Quality Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Reliability Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Alerts</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-500">
                            No suppliers found. Add your first supplier to get started.
                          </td>
                        </tr>
                      ) : (
                        suppliers.map((supplier) => {
                          const performance = supplier.performance || {};
                          const onTimeDelivery = performance.onTimeDelivery || 0;
                          const qualityFailures = performance.qualityFailures || 0;
                          const reliabilityScore = performance.reliabilityScore || 0;
                          const alerts = performance.alerts || [];
                          
                          return (
                            <tr key={supplier._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">{supplier.name}</p>
                                  <p className="text-sm text-gray-500">{supplier.email}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">{supplier.contact}</p>
                                  <p className="text-sm text-gray-500">{supplier.phone}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  supplier.status === 'Active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {supplier.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <span className={`font-medium ${onTimeDelivery >= 90 ? 'text-green-600' : onTimeDelivery >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {onTimeDelivery}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <span className={`font-medium ${qualityFailures <= 2 ? 'text-green-600' : qualityFailures <= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {Math.max(0, 100 - qualityFailures)}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <span className={`font-bold ${getReliabilityColor(reliabilityScore)}`}>
                                    {reliabilityScore}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  {alerts.length > 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      {alerts.length} alerts
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      No alerts
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSupplier(supplier);
                                      setShowPerformanceModal(true);
                                    }}
                                  >
                                    Analytics
                                  </Button>
                                  <Button variant="outline" size="sm">Edit</Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Automated Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle>Automated Alert System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-red-900">Critical Alert: Global Supplies Co. - Multiple contract violations detected</p>
                      <p className="text-sm text-red-700">Supplier reliability score dropped below 75%</p>
                    </div>
                  </div>
                  <span className="text-sm text-red-600">2 hours ago</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-yellow-900">Warning: XYZ Manufacturing - Quality failures increased by 15%</p>
                      <p className="text-sm text-yellow-700">Recommendation: Schedule quality review meeting</p>
                    </div>
                  </div>
                  <span className="text-sm text-yellow-600">1 day ago</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-blue-900">Info: ABC Electronics - Performance improvement detected</p>
                      <p className="text-sm text-blue-700">On-time delivery rate improved to 94.2%</p>
                    </div>
                  </div>
                  <span className="text-sm text-blue-600">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "dashboard" && (
        <SupplierDashboard />
      )}

      {/* Performance Modal */}
      {showPerformanceModal && (
        <PerformanceModal 
          supplier={selectedSupplier} 
          onClose={() => {
            setShowPerformanceModal(false);
            setSelectedSupplier(null);
          }} 
        />
      )}
    </div>
  );
};

export default Suppliers; 