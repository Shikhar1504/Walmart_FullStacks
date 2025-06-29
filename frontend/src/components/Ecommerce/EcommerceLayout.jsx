"use client"

import { Outlet } from "react-router-dom"
import { useState } from "react"
import EcommerceHeader from "./EcommerceHeader"
import EcommerceFooter from "./EcommerceFooter"

export default function EcommerceLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <EcommerceHeader onSearchToggle={() => setIsSearchOpen(!isSearchOpen)} />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <EcommerceFooter />
    </div>
  )
} 