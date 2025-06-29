"use client"

import { Link, useLocation } from "react-router-dom"
import { clsx } from "clsx"
import {
  LayoutDashboard,
  BarChart3,
  DollarSign,
  Users,
  Package,
  Settings,
  ChevronLeft,
  TrendingUp,
  Truck,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "analytics", icon: BarChart3 },
  { name: "Pricing", href: "pricing", icon: DollarSign },
  { name: "Suppliers", href: "suppliers", icon: Users },
  { name: "Inventory", href: "inventory", icon: Package },
  { name: "Order Management", href: "orders", icon: Truck },
  { name: "Settings", href: "settings", icon: Settings },
]

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation()

  return (
    <div
      className={clsx(
        "bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col",
        isOpen ? "w-64" : "w-16",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className={clsx("flex items-center", !isOpen && "justify-center")}>
          <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">SupplyChain</h1>
              <p className="text-xs text-gray-500">Analytics Platform</p>
            </div>
          )}
        </div>
        <button onClick={onToggle} className="p-1 rounded-md hover:bg-gray-100 transition-colors">
          <ChevronLeft className={clsx("w-5 h-5 text-gray-500 transition-transform", !isOpen && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname.endsWith(item.href) || 
                          (item.href === "dashboard" && location.pathname === "/admin")
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-primary-100 text-primary-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon
                className={clsx(
                  "flex-shrink-0 w-5 h-5",
                  isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500",
                )}
              />
              {isOpen && <span className="ml-3">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
