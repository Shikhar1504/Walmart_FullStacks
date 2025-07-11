import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"
import { Toaster } from "sonner"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout/Layout"
import EcommerceLayout from "./components/Ecommerce/EcommerceLayout"
import LoginPage from "./pages/LoginPage"
import AdminLoginPage from "./pages/Admin/AdminLoginPage"
import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Admin/Dashboard"
import Analytics from "./pages/Admin/Analytics"
import Pricing from "./pages/Admin/Pricing"
import Suppliers from "./pages/Admin/Suppliers"
import Inventory from "./pages/Admin/Inventory"
import Settings from "./pages/Admin/Settings"
import NotFound from "./pages/NotFound"
import OrderManagement from "./pages/Admin/OrderManagement"

// E-commerce pages
import HomePage from "./pages/Ecommerce/HomePage"
import ProductsPage from "./pages/Ecommerce/ProductsPage"
import ProductDetailPage from "./pages/Ecommerce/ProductDetailPage"
import CartPage from "./pages/Ecommerce/CartPage"
import CheckoutPage from "./pages/Ecommerce/CheckoutPage"
import UserProfilePage from "./pages/Ecommerce/UserProfilePage"
import RegisterPage from "./pages/Ecommerce/RegisterPage"
import OrderConfirmationPage from "./pages/Ecommerce/OrderConfirmationPage"
import OrderTrackingPage from "./pages/Ecommerce/OrderTrackingPage"

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
        
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
      
            <Route path="/landing" element={<LandingPage />} />
            
            
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="settings" element={<Settings />} />
              <Route path="orders" element={<OrderManagement />} />
            </Route>

    
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <EcommerceLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="order-confirmation/:trackingNumber" element={<OrderConfirmationPage />} />
              <Route path="order-tracking/:trackingNumber" element={<OrderTrackingPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster position="top-center" richColors />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
