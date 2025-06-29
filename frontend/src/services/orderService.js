// Order service for handling order-related API calls
class OrderService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }

  // Get auth headers with credentials
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  // Create a new order
  async createOrder(orderData) {
    try {
      console.log('🔍 Creating order with data:', orderData);
      
      const response = await fetch(`${this.baseURL}/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(orderData)
      });
      
      console.log('📡 Order creation response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Order creation error response:', errorText);
        throw new Error('Failed to create order');
      }
      
      const orderResponse = await response.json();
      console.log('✅ Order created successfully:', {
        orderId: orderResponse._id,
        trackingNumber: orderResponse.trackingNumber,
        total: orderResponse.total
      });
      
      return orderResponse;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  // Get orders (all for admin, user's own for regular users)
  async getOrders() {
    try {
      console.log('🔍 Fetching orders from backend...');
      const response = await fetch(`${this.baseURL}/orders`, {
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });
      
      console.log('📡 Orders response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Orders fetch error response:', errorText);
        throw new Error('Failed to fetch orders');
      }
      
      const ordersData = await response.json();
      console.log('✅ Orders fetched successfully:', ordersData);
      return ordersData;
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      return [];
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const response = await fetch(`${this.baseURL}/orders/${orderId}`, {
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Order not found');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  // Update order status (admin only)
  async updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(`${this.baseURL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Track order by tracking number (public)
  async trackOrder(trackingNumber) {
    try {
      console.log('Tracking order with number:', trackingNumber);
      const response = await fetch(`${this.baseURL}/orders/tracking/${trackingNumber}`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error('Order not found');
      }
      
      const orderData = await response.json();
      console.log('Order data received:', orderData);
      return orderData;
    } catch (error) {
      console.error('Error tracking order:', error);
      return null;
    }
  }
}

export const orderService = new OrderService(); 