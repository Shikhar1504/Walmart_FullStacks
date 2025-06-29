"use client"

import { useParams, Link } from "react-router-dom"
import { CheckCircle, Package, ArrowRight } from "lucide-react"

export default function OrderConfirmationPage() {
  const { trackingNumber } = useParams()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Thank you for your order!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully. You will receive a confirmation email soon.
        </p>
        
        {trackingNumber && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Tracking Number</span>
            </div>
            <p className="text-lg font-mono text-gray-900">{trackingNumber}</p>
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          {trackingNumber && (
            <Link 
              to={`/order-tracking/${trackingNumber}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Package className="w-4 h-4 mr-2" />
              Track My Order
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
          <Link 
            to="/profile?tab=orders" 
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            View My Orders
          </Link>
          <Link 
            to="/products" 
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
} 