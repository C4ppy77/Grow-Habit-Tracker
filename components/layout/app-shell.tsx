"use client"

import type React from "react"
import TopNav from "@/components/navigation/top-nav"
import BottomNav from "@/components/navigation/bottom-nav"
import CookieBanner from "@/components/privacy/cookie-banner"

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <TopNav />

      {/* Mobile Header - only show on mobile when TopNav is hidden */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            <span className="text-leaf">GR</span>
            <span className="text-petal">🌸</span>
            <span className="text-leaf">W</span>
          </h1>
        </div>
      </header>

      <main className="pb-20 lg:pb-0">{children}</main>
      <BottomNav />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  )
}
