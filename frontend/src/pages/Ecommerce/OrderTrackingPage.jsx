"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Package, CheckCircle, Clock, Truck, ArrowLeft, Calendar, MapPin, Phone, Mail } from "lucide-react"
import { orderService } from "../../services/orderService"
import { useToast } from "../../contexts/ToastContext"

export default function OrderTrackingPage() {
  const { trackingNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  console.log('🔍 OrderTrackingPage loaded with trackingNumber:', trackingNumber)

  useEffect(() => {
    console.log('🔍 useEffect triggered with trackingNumber:', trackingNumber)
    if (trackingNumber) {
      loadOrder()
    } else {
      console.log('❌ No tracking number provided')
      setLoading(false)
      toast.error('No tracking number provided')
    }
  }, [trackingNumber])

  const loadOrder = async () => {
    try {
      console.log('🔍 Loading order with tracking number:', trackingNumber)
      setLoading(true)
      const orderData = await orderService.trackOrder(trackingNumber)
      if (orderData) {
        console.log('✅ Order data received:', orderData)
        setOrder(orderData)
      } else {
        console.log('❌ No order data received')
        toast.error('Order not found')
      }
    } catch (error) {
      console.error('❌ Error loading order:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusStep = (status) => {
    switch (status) {
      case 'processing':
        return 1
      case 'out_for_delivery':
        return 2
      case 'delivered':
        return 3
      default:
        return 1
    }
  }

  const getStatusIcon = (step, currentStep) => {
    if (step < currentStep) {
      return <CheckCircle className="w-6 h-6 text-green-600" />
    } else if (step === currentStep) {
      return <Clock className="w-6 h-6 text-blue-600" />
    } else {
      return <Clock className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusColor = (step, currentStep) => {
    if (step < currentStep) {
      return 'text-green-600'
    } else if (step === currentStep) {
      return 'text-blue-600'
    } else {
      return 'text-gray-400'
    }
  }

  const getStatusBgColor = (step, currentStep) => {
    if (step < currentStep) {
      return 'bg-green-100'
    } else if (step === currentStep) {
      return 'bg-blue-100'
    } else {
      return 'bg-gray-100'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const currentStep = getStatusStep(order.status)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile?tab=orders"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
          <p className="text-gray-600">
            Tracking number: {order.trackingNumber}
          </p>
        </div>

        {/* Order Status Stepper */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
          
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-1 bg-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {[
                { step: 1, title: 'Processing', description: 'Order is being prepared' },
                { step: 2, title: 'Out for Delivery', description: 'Order is on its way' },
                { step: 3, title: 'Delivered', description: 'Order has been delivered' }
              ].map(({ step, title, description }) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusBgColor(step, currentStep)} mb-3`}>
                    {getStatusIcon(step, currentStep)}
                  </div>
                  <div className="text-center">
                    <h3 className={`font-medium ${getStatusColor(step, currentStep)}`}>
                      {title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Package className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium">{formatPrice(order.total)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="font-medium">{order.customerInfo.address}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{order.customerInfo.email}</p>
                </div>
              </div>
              
              {order.customerInfo.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{order.customerInfo.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} • Supplier: {item.supplierName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatPrice((item.discountPrice || item.price) * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.discountPrice || item.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-semibold text-gray-900">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 