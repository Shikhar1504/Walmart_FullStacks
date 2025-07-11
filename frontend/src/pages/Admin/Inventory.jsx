import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    expired: 0,
    activeProducts: 0
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    location: '',
    seller: '',
    description: '',
    image: '',
    expiryDate: '',
    batchNumber: '',
    purchasePrice: '',
    weight: '',
    barcode: '',
    features: '',
    specifications: '',
    notes: ''
  });

  const categories = ['Electronics', 'Accessories', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Food & Beverages', 'Health & Beauty', 'Automotive', 'Other'];

  // Fetch inventory data from backend
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/inventory/with-products', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setInventory(data);
        } else if (response.status === 401) {
          console.error('Authentication required. Please log in as admin.');
          alert('Please log in as admin to view inventory.');
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setSuppliersLoading(true);
        const response = await fetch('http://localhost:5000/api/inventory/suppliers', {
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/inventory/dashboard', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.quantity || !newItem.price || !newItem.seller) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/inventory/with-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          price: parseFloat(newItem.price),
          quantity: parseInt(newItem.quantity),
          location: newItem.location || 'Warehouse A',
          seller: newItem.seller,
          description: newItem.description,
          image: newItem.image,
          expiryDate: newItem.expiryDate || null,
          batchNumber: newItem.batchNumber || null,
          purchasePrice: newItem.purchasePrice ? parseFloat(newItem.purchasePrice) : null,
          weight: newItem.weight ? parseFloat(newItem.weight) : null,
          barcode: newItem.barcode || null,
          features: newItem.features || null,
          specifications: newItem.specifications || null,
          notes: newItem.notes || null
        })
      });

      if (response.ok) {
        const newInventoryItem = await response.json();
        setInventory(prev => [...prev, newInventoryItem]);
        
        // Reset form
        setNewItem({
          name: '',
          category: '',
          price: '',
          quantity: '',
          location: '',
          seller: '',
          description: '',
          image: '',
          expiryDate: '',
          batchNumber: '',
          purchasePrice: '',
          weight: '',
          barcode: '',
          features: '',
          specifications: '',
          notes: ''
        });
        setShowAddModal(false);
        
        // Refresh dashboard data
        const dashboardResponse = await fetch('http://localhost:5000/api/inventory/dashboard', {
          credentials: 'include'
        });
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setDashboardData(dashboardData);
        }
      } else if (response.status === 401) {
        // Try to refresh token and retry
        console.log('🔄 Token expired, attempting refresh...');
        const refreshResponse = await fetch('http://localhost:5000/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (refreshResponse.ok) {
          console.log('🔄 Token refreshed, retrying request...');
          // Retry the original request
          const retryResponse = await fetch('http://localhost:5000/api/inventory/with-product', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              name: newItem.name,
              category: newItem.category,
              price: parseFloat(newItem.price),
              quantity: parseInt(newItem.quantity),
              location: newItem.location || 'Warehouse A',
              seller: newItem.seller,
              description: newItem.description,
              image: newItem.image,
              expiryDate: newItem.expiryDate || null,
              batchNumber: newItem.batchNumber || null,
              purchasePrice: newItem.purchasePrice ? parseFloat(newItem.purchasePrice) : null,
              weight: newItem.weight ? parseFloat(newItem.weight) : null,
              barcode: newItem.barcode || null,
              features: newItem.features || null,
              specifications: newItem.specifications || null,
              notes: newItem.notes || null
            })
          });
          
          if (retryResponse.ok) {
            const newInventoryItem = await retryResponse.json();
            setInventory(prev => [...prev, newInventoryItem]);
            
            // Reset form
            setNewItem({
              name: '',
              category: '',
              price: '',
              quantity: '',
              location: '',
              seller: '',
              description: '',
              image: '',
              expiryDate: '',
              batchNumber: '',
              purchasePrice: '',
              weight: '',
              barcode: '',
              features: '',
              specifications: '',
              notes: ''
            });
            setShowAddModal(false);
            
            // Refresh dashboard data
            const dashboardResponse = await fetch('http://localhost:5000/api/inventory/dashboard', {
              credentials: 'include'
            });
            if (dashboardResponse.ok) {
              const dashboardData = await dashboardResponse.json();
              setDashboardData(dashboardData);
            }
          } else {
            alert('Authentication required. Please log in as admin to add items.');
          }
        } else {
          alert('Authentication required. Please log in as admin to add items.');
        }
      } else if (response.status === 403) {
        alert('Access denied. Admin privileges required to add items.');
      } else {
        const error = await response.json();
        alert(`Error adding item: ${error.message || 'Please try again later'}`);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item. Please try again later.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (response.ok) {
          setInventory(prev => prev.filter(item => item.id !== id));
          
          // Refresh dashboard data
          const dashboardResponse = await fetch('http://localhost:5000/api/inventory/dashboard', {
            credentials: 'include'
          });
          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            setDashboardData(dashboardData);
          }
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name || '',
      category: item.category || '',
      price: item.price || '',
      quantity: item.quantity || '',
      location: item.location || '',
      seller: item.supplier || '',
      description: item.description || '',
      image: item.image || '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      batchNumber: item.batchNumber || '',
      purchasePrice: item.purchasePrice || '',
      weight: item.weight || '',
      barcode: item.barcode || '',
      features: item.features || '',
      specifications: item.specifications || '',
      notes: item.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          price: parseFloat(newItem.price),
          quantity: parseInt(newItem.quantity),
          location: newItem.location || 'Warehouse A',
          supplier: newItem.seller,
          description: newItem.description,
          image: newItem.image,
          expiryDate: newItem.expiryDate || null,
          batchNumber: newItem.batchNumber || null,
          purchasePrice: newItem.purchasePrice ? parseFloat(newItem.purchasePrice) : null,
          weight: newItem.weight ? parseFloat(newItem.weight) : null,
          barcode: newItem.barcode || null,
          features: newItem.features || null,
          specifications: newItem.specifications || null,
          notes: newItem.notes || null
        })
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setInventory(prev => prev.map(item => 
          item.id === editingItem.id ? updatedItem : item
        ));
        
        // Reset form and close modal
        setNewItem({
          name: '',
          category: '',
          price: '',
          quantity: '',
          location: '',
          seller: '',
          description: '',
          image: '',
          expiryDate: '',
          batchNumber: '',
          purchasePrice: '',
          weight: '',
          barcode: '',
          features: '',
          specifications: '',
          notes: ''
        });
        setEditingItem(null);
        setShowEditModal(false);
        
        // Refresh dashboard data
        const dashboardResponse = await fetch('http://localhost:5000/api/inventory/dashboard', {
          credentials: 'include'
        });
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setDashboardData(dashboardData);
        }
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-2">Manage your product inventory, suppliers, and stock levels</p>
      </div>

      <div className="grid gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.totalItems}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardData.inStock}</p>
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
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboardData.lowStock}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardData.outOfStock}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-gray-600">{dashboardData.expired}</p>
                </div>
                <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboardData.activeProducts}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {suppliersLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading supplier data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                  <p className="text-sm text-gray-600">Total Suppliers</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {suppliers.filter(s => s.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600">Active Suppliers</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {suppliers.filter(s => s.performance && s.performance.reliabilityScore >= 90).length}
                  </p>
                  <p className="text-sm text-gray-600">Excellent Performance</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {suppliers.filter(s => s.performance && s.performance.alerts && s.performance.alerts.length > 0).length}
                  </p>
                  <p className="text-sm text-gray-600">Suppliers with Alerts</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Items</CardTitle>
              <Button onClick={() => setShowAddModal(true)}>Add New Item</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
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
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                        Product
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        SKU
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Category
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                        Supplier
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Qty
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Price
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Location
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Expiry
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-gray-500">
                          No inventory items found. Add your first item to get started.
                        </td>
                      </tr>
                    ) : (
                      inventory.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3">
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-sm text-gray-500 truncate">{item.batchNumber || 'No batch'}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-900 text-sm">{item.sku}</td>
                          <td className="py-3 px-3 text-gray-900 text-sm">{item.category}</td>
                          <td className="py-3 px-3">
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{item.supplier}</p>
                              {(() => {
                                const supplierDetails = suppliers.find(s => s.name === item.supplier);
                                return supplierDetails ? (
                                  <div className="text-xs text-gray-500 space-y-0.5">
                                    {supplierDetails.performance && supplierDetails.performance.reliabilityScore > 0 && (
                                      <div className="flex items-center space-x-1">
                                        <span className="text-xs">Reliability:</span>
                                        <span className={`text-xs px-1 py-0.5 rounded-full ${
                                          supplierDetails.performance.reliabilityScore >= 90 ? 'bg-green-100 text-green-800' :
                                          supplierDetails.performance.reliabilityScore >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {supplierDetails.performance.reliabilityScore}%
                                        </span>
                                      </div>
                                    )}
                                    {supplierDetails.status && (
                                      <span className={`text-xs px-1 py-0.5 rounded-full ${
                                        supplierDetails.status === 'active' ? 'bg-green-100 text-green-800' :
                                        supplierDetails.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {supplierDetails.status}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400">No details</p>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-900 text-sm">{item.quantity}</td>
                          <td className="py-3 px-3 text-gray-900 text-sm">${item.price}</td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-900 text-sm truncate">{item.location}</td>
                          <td className="py-3 px-3 text-gray-900 text-sm">{formatDate(item.expiryDate)}</td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col space-y-1">
                              {/* Removed Edit button as requested */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  name="seller"
                  value={newItem.seller}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supplier name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={newItem.batchNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter batch number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={newItem.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Price ($)
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={newItem.purchasePrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (g)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={newItem.weight}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={newItem.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Warehouse A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={newItem.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={newItem.barcode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter barcode"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product description"
                  rows="3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={newItem.image}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  name="features"
                  value={newItem.features}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={newItem.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about this item"
                  rows="2"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleAddItem}
                className="flex-1"
              >
                Add Item
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory; 