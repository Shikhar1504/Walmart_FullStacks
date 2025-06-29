// Product service with real backend integration
class ProductService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }

  // Normalize product data to ensure consistent id field
  normalizeProduct(product) {
    return {
      ...product,
      id: product._id || product.id // Use _id if available, otherwise keep existing id
    };
  }

  // Normalize array of products
  normalizeProducts(products) {
    return products.map(product => this.normalizeProduct(product));
  }

  // Fetch all products from backend
  async getProducts(filters = {}) {
    try {
      let url = `${this.baseURL}/products`;
      const params = new URLSearchParams();
      
      // Request a high limit to get all products for e-commerce frontend
      params.append('limit', '1000');
      
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.inStock !== undefined) params.append('inStock', filters.inStock);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('🔍 Fetching products from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('📦 Raw response data:', data);
      
      // Handle both array and { products, total } response formats
      const products = Array.isArray(data) ? data : (data.products || []);
      console.log('📋 Products array length:', products.length);
      
      // Normalize products and apply client-side filtering
      const normalizedProducts = this.normalizeProducts(products);
      console.log('✨ Normalized products length:', normalizedProducts.length);
      
      const filteredProducts = this.applyClientSideFilters(normalizedProducts, filters);
      console.log('🎯 Final filtered products length:', filteredProducts.length);
      
      return filteredProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Apply additional client-side filtering
  applyClientSideFilters(products, filters) {
    let filteredProducts = [...products];

    // Price filtering
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    // Rating filtering
    if (filters.minRating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= parseFloat(filters.minRating));
    }

    // Stock filtering
    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.inStock === filters.inStock);
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'name':
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    return filteredProducts;
  }

  // Get product by ID
  async getProductById(id) {
    try {
      const response = await fetch(`${this.baseURL}/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const product = await response.json();
      return this.normalizeProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Get categories from backend
  async getCategories() {
    try {
      const response = await fetch(`${this.baseURL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const categories = await response.json();
      
      // Map backend categories to frontend format with icons
      const categoryIcons = {
        'Electronics': '📱',
        'Clothing': '👕',
        'Home': '🏠',
        'Sports': '⚽',
        'Books': '📚',
        'Toys': '🧸',
        'Accessories': '👜'
      };
      
      return categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        icon: categoryIcons[cat.name] || '📦'
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return default categories if backend fails
      return [
        { id: 'electronics', name: 'Electronics', icon: '📱' },
        { id: 'clothing', name: 'Clothing', icon: '👕' },
        { id: 'home', name: 'Home', icon: '🏠' },
        { id: 'sports', name: 'Sports', icon: '⚽' },
        { id: 'books', name: 'Books', icon: '📚' },
        { id: 'toys', name: 'Toys', icon: '🧸' }
      ];
    }
  }

  // Get featured products
  async getFeaturedProducts() {
    try {
      const response = await fetch(`${this.baseURL}/products/featured`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }
      const products = await response.json();
      return this.normalizeProducts(products);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  // Search products
  async searchProducts(query) {
    try {
      const response = await fetch(`${this.baseURL}/products/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search products');
      }
      const products = await response.json();
      return this.normalizeProducts(products);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const response = await fetch(`${this.baseURL}/products?category=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products by category');
      }
      const products = await response.json();
      return this.normalizeProducts(products);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // Get comments for a product
  async getComments(productId) {
    try {
      const url = `${this.baseURL}/products/${productId}/comments`;
      console.log('🔍 Calling getComments with URL:', url);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response text:', errorText);
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      console.log('✅ Comments data received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      return { comments: [], averageRating: 0, totalReviews: 0 };
    }
  }

  // Add comment to a product
  async addComment(productId, commentData) {
    try {
      const response = await fetch(`${this.baseURL}/products/${productId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(commentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
}

export const productService = new ProductService(); 