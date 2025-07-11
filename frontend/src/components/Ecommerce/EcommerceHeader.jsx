"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useCart } from "../../contexts/CartContext"
import { productService } from "../../services/productService"

export default function EcommerceHeader({ onSearchToggle }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState([])
  const location = useLocation()
  const { user, logout } = useAuth()
  const { getCartCount } = useCart()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productService.getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  // Create navigation items dynamically from categories
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    ...categories
      .filter(category => category.name !== "Home") // Filter out "Home" to avoid duplicate keys
      .slice(0, 4)
      .map(category => ({
        name: category.name,
        href: `/products?category=${category.id}`
      }))
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-50">
      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-900">Walmart</h1>
              <p className="text-xs text-gray-500">Save money. Live better.</p>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* User menu */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/profile?tab=orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        {user.role !== "admin" && (
                          <Link
                            to="/admin/login"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Admin Access
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            logout()
                            setIsUserMenuOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">Sign in</span>
                </Link>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartCount() > 99 ? "99+" : getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Navigation */}
        <nav className="hidden md:block border-t border-gray-200">
          <div className="flex items-center space-x-8 py-4">
            {navigation.map((item) => {
              // Check if this link is active
              const isActive = (() => {
                if (item.href === "/") {
                  return location.pathname === "/"
                }
                if (item.href.startsWith("/products")) {
                  if (item.href === "/products") {
                    return location.pathname === "/products" && !location.search
                  }
                  // For category links, check if the category parameter matches
                  const urlParams = new URLSearchParams(location.search)
                  const categoryParam = urlParams.get("category")
                  const itemCategory = item.href.split("category=")[1]
                  return location.pathname === "/products" && categoryParam === itemCategory
                }
                return location.pathname === item.href
              })()

              return (
                <Link
                  key={`${item.name}-${item.href}`}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary-600"
                      : "text-gray-600 hover:text-primary-600"
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-4 space-y-2">
              {navigation.map((item) => {
                // Check if this link is active (same logic as desktop)
                const isActive = (() => {
                  if (item.href === "/") {
                    return location.pathname === "/"
                  }
                  if (item.href.startsWith("/products")) {
                    if (item.href === "/products") {
                      return location.pathname === "/products" && !location.search
                    }
                    // For category links, check if the category parameter matches
                    const urlParams = new URLSearchParams(location.search)
                    const categoryParam = urlParams.get("category")
                    const itemCategory = item.href.split("category=")[1]
                    return location.pathname === "/products" && categoryParam === itemCategory
                  }
                  return location.pathname === item.href
                })()

                return (
                  <Link
                    key={`${item.name}-${item.href}`}
                    to={item.href}
                    className={`block px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 