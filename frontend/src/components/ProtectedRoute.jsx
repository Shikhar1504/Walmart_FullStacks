"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoadingSpinner from "./UI/LoadingSpinner"

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    // If not logged in, redirect to landing page which will handle the redirect
    return <Navigate to="/landing" replace />
  }

  // If admin access is required but user is not admin
  if (requireAdmin && user.role !== "admin") {
    // Redirect non-admin users to e-commerce home
    return <Navigate to="/" replace />
  }

  // If user is admin but trying to access e-commerce routes
  if (user.role === "admin" && !requireAdmin) {
    // Allow admin to access e-commerce pages
    return children
  }

  return children
}
