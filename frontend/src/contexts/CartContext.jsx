"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { orderService } from "../services/orderService"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("walmart-cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        localStorage.removeItem("walmart-cart")
      }
    }
    
    // Load orders from localStorage - but only if user is logged in
    if (user) {
      const savedOrders = localStorage.getItem("walmart-orders")
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders))
        } catch (error) {
          localStorage.removeItem("walmart-orders")
        }
      }
    } else {
      // Clear orders when user is not logged in
      setOrders([])
      localStorage.removeItem("walmart-orders")
    }
    
    setLoading(false)
  }, [user])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("walmart-cart", JSON.stringify(cart))
    }
  }, [cart, loading])

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (!loading && user) {
      localStorage.setItem("walmart-orders", JSON.stringify(orders))
    }
  }, [orders, loading, user])

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prevCart, { ...product, quantity }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.discountPrice || item.price
      return total + (price * item.quantity)
    }, 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  const getCartItemQuantity = (productId) => {
    const item = cart.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const isInCart = (productId) => {
    return cart.some(item => item.id === productId)
  }

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  }

  const getDiscountTotal = () => {
    return getCartSubtotal() - getCartTotal()
  }

  // Order tracking functions - now handled by backend
  const createOrder = async (orderData) => {
    try {
      // Prepare items with supplier information
      const itemsWithSuppliers = cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        discountPrice: item.discountPrice,
        quantity: item.quantity,
        image: item.image,
        supplierId: item.supplier,
        supplierName: item.supplierName
      }));

      const orderPayload = {
        items: itemsWithSuppliers,
        total: getCartTotal() + (getCartTotal() >= 35 ? 0 : 5.99),
        customerInfo: orderData
      };

      // Create order in backend
      const createdOrder = await orderService.createOrder(orderPayload);
      
      // Clear cart after successful order creation
      clearCart();
      
      return createdOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  const updateOrderStatus = (orderId, newStatus) => {
    // This is now handled by the backend order service
    console.log('Order status updates are now handled by the backend');
  }

  const getOrders = () => {
    // This is now handled by the backend order service
    return [];
  }

  const getOrderById = (orderId) => {
    // This is now handled by the backend order service
    return null;
  }

  // Clear all orders (for new users or admin purposes)
  const clearOrders = () => {
    setOrders([])
    localStorage.removeItem("walmart-orders")
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getCartItemQuantity,
    isInCart,
    getCartSubtotal,
    getDiscountTotal,
    loading,
    createOrder,
    updateOrderStatus,
    getOrders,
    getOrderById,
    clearOrders,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
} 