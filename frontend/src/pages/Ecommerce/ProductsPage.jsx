"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Star, ShoppingCart, Grid, List, Filter, X, ChevronDown, Plus, Minus } from "lucide-react"
import { productService } from "../../services/productService"
import { useCart } from "../../contexts/CartContext"
import { Link } from "react-router-dom"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    inStock: undefined,
    sortBy: ''
  })
  const location = useLocation()
  const { addToCart, updateQuantity, isInCart, getCartItemQuantity } = useCart()

  useEffect(() => {
    const initializePage = async () => {
      try {
        const categories = await productService.getCategories();
        setCategories(categories);
        
        // Get initial filters from URL params using URLSearchParams
        const searchParams = new URLSearchParams(location.search);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        
        const initialFilters = {
          category: category || '',
          search: search || '',
          minPrice: '',
          maxPrice: '',
          minRating: '',
          inStock: undefined,
          sortBy: ''
        };
        
        setFilters(initialFilters);
        await loadProducts(initialFilters);
      } catch (error) {
        console.error('Error initializing page:', error);
      }
    };

    initializePage();
    
    // Scroll to top when navigating to this page
    window.scrollTo(0, 0);
  }, [location.search]);

  // Additional useEffect to handle scroll-to-top on component mount and pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const loadProducts = async (currentFilters) => {
    setLoading(true);
    try {
      const filteredProducts = await productService.getProducts(currentFilters);
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    await loadProducts(newFilters);
  };

  const clearFilters = async () => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      inStock: undefined,
      sortBy: ''
    };
    setFilters(clearedFilters);
    await loadProducts(clearedFilters);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const ProductCard = ({ product }) => (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={e => {
        // Prevent add to cart if a link was clicked
        if (
          e.target.closest('a') ||
          e.target.tagName === 'A' ||
          e.target.closest('button')
        ) return;
        if (!isInCart(product.id) && product.inStock) addToCart(product);
      }}
    >
      <Link to={`/product/${product.id}`}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{product.brand}</span>
          <div className="flex items-center">
            {renderStars(product.rating)}
            <span className="ml-1 text-sm text-gray-600">({product.reviewCount})</span>
          </div>
        </div>
        <Link to={`/product/${product.id}`} tabIndex={-1} onClick={e => e.stopPropagation()}>
          <h3 className="font-medium text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {product.discountPrice ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        {isInCart(product.id) ? (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={e => { e.stopPropagation(); updateQuantity(product.id, getCartItemQuantity(product.id) - 1); }}
              disabled={!product.inStock}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 bg-gray-50 text-gray-900 font-medium rounded-lg min-w-[3rem] text-center">
              {getCartItemQuantity(product.id)}
            </span>
            <button
              onClick={e => { e.stopPropagation(); updateQuantity(product.id, getCartItemQuantity(product.id) + 1); }}
              disabled={!product.inStock}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); addToCart(product); }}
            disabled={!product.inStock}
            className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  )

  const ProductListItem = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-center space-x-6">
        <Link to={`/product/${product.id}`} className="flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="h-32 w-32 object-cover rounded-lg"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{product.brand}</span>
            <div className="flex items-center">
              {renderStars(product.rating)}
              <span className="ml-1 text-sm text-gray-600">({product.reviewCount})</span>
            </div>
          </div>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {product.discountPrice ? (
                <>
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              {isInCart(product.id) ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(product.id, getCartItemQuantity(product.id) - 1)}
                    disabled={!product.inStock}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 bg-gray-50 text-gray-900 font-medium rounded-lg min-w-[3rem] text-center">
                    {getCartItemQuantity(product.id)}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, getCartItemQuantity(product.id) + 1)}
                    disabled={!product.inStock}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">
            {products.length} products found
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock === true}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked ? true : undefined)}
                      className="mr-2"
                    />
                    In Stock Only
                  </label>
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {products.map((product) => (
                  viewMode === 'grid' ? (
                    <ProductCard key={product.id} product={product} />
                  ) : (
                    <ProductListItem key={product.id} product={product} />
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 