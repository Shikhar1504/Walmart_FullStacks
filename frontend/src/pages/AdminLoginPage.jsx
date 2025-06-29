"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import Button from "../components/UI/Button"
import { TrendingUp, Mail, Lock, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.success) {
      if (result.user?.role === "admin") {
        navigate("/admin/dashboard")
        toast.success("Welcome Admin!", "Login Successful")
      } else {
        setError("Access denied. Admin credentials required.")
        toast.error("Access denied. Admin credentials required.", "Login Failed")
      }
    } else {
      setError(result.error || "Invalid credentials.")
      toast.error(result.error, "Login Failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Access</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access the admin dashboard</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter admin email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter admin password"
                />
              </div>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <Button type="submit" className="w-full" loading={loading}>
            Access Admin Dashboard
          </Button>

          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Admin Credentials:</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <strong>Email:</strong> admin@supply.com
              </p>
              <p>
                <strong>Password:</strong> admin123
              </p>
              <p className="text-xs text-gray-500 mt-1">
                • Only admin users can access this dashboard
              </p>
            </div>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <a href="/login" className="text-red-600 hover:underline">← Back to regular login</a>
        </div>
      </div>
    </div>
  )
} 