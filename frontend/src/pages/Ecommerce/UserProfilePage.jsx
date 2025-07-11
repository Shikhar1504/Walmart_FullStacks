"use client"

import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { Package, Clock, Truck, CheckCircle, Eye } from "lucide-react"
import { clearLocalStorageOrders } from "../../utils/clearOrders"
import { orderService } from "../../services/orderService"
import { toast } from "sonner"
import OrderDetailModal from "../../components/UI/OrderDetailModal"

export default function UserProfilePage() {
  const { user } = useAuth()
  const { clearOrders } = useCart()
  const [tab, setTab] = useState("account")
  const [ordersCleared, setOrdersCleared] = useState(false)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const location = useLocation()

  // Fetch orders from backend
  const fetchOrders = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      console.log('🔍 Fetching orders for user:', user.email)
      const ordersData = await orderService.getOrders()
      console.log('✅ Orders fetched successfully:', ordersData)
      setOrders(ordersData)
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      toast.error('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Clear orders for new users on first visit
  useEffect(() => {
    if (user && !ordersCleared) {
      // Check if this is a new user (created within the last hour)
      const userCreatedTime = new Date(user.createdAt || Date.now())
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      if (userCreatedTime > oneHourAgo) {
        // Clear existing orders for new users
        clearOrders()
        clearLocalStorageOrders()
        setOrdersCleared(true)
        console.log("🧹 Cleared orders for new user")
      }
    }
  }, [user, ordersCleared, clearOrders])

  // Fetch orders when user changes or tab changes to orders
  useEffect(() => {
    if (user && tab === 'orders') {
      fetchOrders()
    }
  }, [user, tab])

  // Also fetch orders on mount if user is already on orders tab
  useEffect(() => {
    if (user && tab === 'orders' && orders.length === 0 && !loading) {
      fetchOrders()
    }
  }, [user, tab, orders.length, loading])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      processing: { text: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
      out_for_delivery: { text: 'Out for Delivery', color: 'bg-blue-100 text-blue-800' },
      delivered: { text: 'Delivered', color: 'bg-green-100 text-green-800' }
    }
    
    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.text}</span>
      </span>
    )
  }

  const handleOrderClick = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  useEffect(() => {
    if (location.search) {
      const searchParams = new URLSearchParams(location.search)
      const tab = searchParams.get('tab')
      if (tab === 'orders') {
        setTab('orders')
      }
    }
  }, [location.search])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        <div className="flex space-x-4 mb-8">
          <button
            className={`px-4 py-2 rounded-lg font-medium ${tab === "account" ? "bg-primary-600 text-white" : "bg-white text-gray-700 border border-gray-200"}`}
            onClick={() => setTab("account")}
          >
            Account
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${tab === "orders" ? "bg-primary-600 text-white" : "bg-white text-gray-700 border border-gray-200"}`}
            onClick={() => setTab("orders")}
          >
            Orders
          </button>
        </div>
        {tab === "account" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="flex items-center space-x-6 mb-6">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <div className="text-lg font-bold text-gray-900">{user.name}</div>
                <div className="text-gray-600">{user.email}</div>
                <div className="text-gray-500 text-sm capitalize">{user.role}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Full Name</span>
                <span className="text-gray-900">{user.name}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Role</span>
                <span className="text-gray-900 capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        )}
        {tab === "orders" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order History</h2>
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Refresh Orders'
                )}
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading orders...</h3>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">Start shopping to see your order history here.</p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order._id || order.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">Order #{order.trackingNumber}</h3>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(order.status)}
                        <Link
                          to={`/order-tracking/${order.trackingNumber}`}
                          className="text-primary-600 hover:text-primary-700"
                          title="Track Order"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item._id || item.id || item.productId} className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-gray-900">
                            {formatPrice((item.discountPrice || item.price) * item.quantity)}
                          </p>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total</span>
                        <span className="font-medium text-gray-900">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
} 