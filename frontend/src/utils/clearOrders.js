/**
 * Utility function to clear orders from localStorage
 * This function removes any stored order data from the browser's localStorage
 */
export const clearLocalStorageOrders = () => {
  try {
    // Remove orders from localStorage
    localStorage.removeItem('orders')
    localStorage.removeItem('cart')
    
    // Also clear any other order-related data
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('order') || key.includes('cart'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    console.log('🗑️ Cleared order data from localStorage')
  } catch (error) {
    console.error('Error clearing localStorage orders:', error)
  }
} 