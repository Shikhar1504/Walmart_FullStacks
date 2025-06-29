"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Star, ShoppingCart, ArrowRight, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react"
import { productService } from "../../services/productService"
import { useCart } from "../../contexts/CartContext"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const { addToCart, updateQuantity, isInCart, getCartItemQuantity } = useCart()

  const heroSlides = [
    {
      id: 1,
      title: "Save Big on Electronics",
      subtitle: "Up to 50% off on TVs, phones, and more",
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&h=400&fit=crop",
      cta: "Shop Now",
      link: "/products?category=electronics"
    },
    {
      id: 2,
      title: "New Arrivals in Fashion",
      subtitle: "Discover the latest trends in clothing",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop",
      cta: "Explore Fashion",
      link: "/products?category=clothing"
    },
    {
      id: 3,
      title: "Home & Garden Essentials",
      subtitle: "Everything you need for your home",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=400&fit=crop",
      cta: "Shop Home",
      link: "/products?category=home"
    }
  ]

  useEffect(() => {
    async function fetchData() {
      setFeaturedProducts(await productService.getFeaturedProducts());
      setCategories(await productService.getCategories());
    }
    fetchData();
  }, []);

  // Auto-rotation for hero slider
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 2000) // Change slide every 2 seconds

    return () => clearInterval(interval)
  }, [heroSlides.length, isPaused])

  const nextSlide = () => {
    setIsPaused(true)
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    // Resume auto-rotation after 3 seconds
    setTimeout(() => setIsPaused(false), 3000)
  }

  const prevSlide = () => {
    setIsPaused(true)
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    // Resume auto-rotation after 3 seconds
    setTimeout(() => setIsPaused(false), 3000)
  }

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

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section 
        className="relative h-96 md:h-[500px] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 z-20 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-8">
                      {slide.subtitle}
                    </p>
                    <Link
                      to={slide.link}
                      className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {slide.cta}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsPaused(true)
                setCurrentSlide(index)
                // Resume auto-rotation after 3 seconds
                setTimeout(() => setIsPaused(false), 3000)
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Find what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Handpicked products for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Link to={`/product/${product.id}`}>
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
                  <Link to={`/product/${product.id}`}>
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
                      className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Free Shipping on Orders Over $35
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Plus, get free returns and 24/7 customer support
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Shopping
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
} 