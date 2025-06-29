"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to refresh access token
  const refreshAccessToken = async () => {
    try {
      console.log('🔄 Attempting to refresh access token...');
      const response = await fetch('http://localhost:5000/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('🔄 Access token refreshed successfully');
        return true;
      } else {
        console.log('🔄 Failed to refresh access token');
        return false;
      }
    } catch (error) {
      console.error('🔄 Error refreshing token:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check for existing session by calling the backend
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication status...');
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        
        console.log('🔍 Auth check response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('🔍 Auth check successful:', userData);
          setUser(userData.user);
        } else if (response.status === 401) {
          // Token might be expired, try to refresh
          console.log('🔍 Token expired, attempting refresh...');
          const refreshSuccess = await refreshAccessToken();
          
          if (refreshSuccess) {
            // Try the auth check again
            const retryResponse = await fetch('http://localhost:5000/api/auth/me', {
              credentials: 'include'
            });
            
            if (retryResponse.ok) {
              const userData = await retryResponse.json();
              console.log('🔍 Auth check successful after refresh:', userData);
              setUser(userData.user);
            } else {
              console.log('🔍 Auth check failed even after refresh');
              setUser(null);
            }
          } else {
            console.log('🔍 No valid session found');
            setUser(null);
          }
        } else {
          console.log('🔍 No valid session found');
          setUser(null);
        }
      } catch (error) {
        console.error('🔍 Error checking authentication:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [])

  const login = async (email, password) => {
    setLoading(true)

    try {
      console.log('🔐 Attempting login with:', { email });
      console.log('🔐 Making request to: http://localhost:5000/api/auth/login');
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      console.log('🔐 Login response status:', response.status);
      console.log('🔐 Login response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('🔐 Login response data:', data);

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else if (response.status === 429) {
        return { success: false, error: 'Too many login attempts. Please wait 15 minutes before trying again.' };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('🔐 Login error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    refreshAccessToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
