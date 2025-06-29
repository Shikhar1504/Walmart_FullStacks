"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../contexts/ToastContext"
import Button from "../components/UI/Button"
import { TrendingUp, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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
      // Redirect based on role
      if (result.user?.role === "admin") {
        navigate("/admin/dashboard")
        toast.success("Welcome Admin!", "Login Successful")
      } else {
        // Regular users go to e-commerce home page
        navigate("/")
        toast.success("Welcome back!", "Login Successful")
      }
    } else {
      setError(result.error || "Invalid credentials.")
      toast.error(result.error, "Login Failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
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
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
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
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>

          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Access Information:</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <strong>Admin Access:</strong> admin@supply.com / admin123
              </p>
              <p className="text-xs text-gray-500 mt-1">
                • Admin users will be redirected to the admin dashboard
              </p>
              <p className="text-xs text-gray-500">
                • Regular users will be redirected to the e-commerce site
              </p>
            </div>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <a href="/register" className="text-primary-600 hover:underline">Register</a>
        </div>
        
        <div className="mt-2 text-center text-xs text-gray-500">
          <a href="/admin/login" className="text-gray-600 hover:underline">Admin Access →</a>
        </div>
      </div>
    </div>
  )
}
