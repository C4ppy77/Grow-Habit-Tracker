"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/home", label: "Home" },
  { href: "/garden", label: "Garden" },
  { href: "/seeds", label: "Seeds" },
  { href: "/account", label: "Account" },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-40 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-leaf">GR</span>
              <span className="text-petal">🌸</span>
              <span className="text-leaf">W</span>
            </Link>

            <nav className="flex space-x-8" role="navigation" aria-label="Main navigation">
              {navItems.map(({ href, label }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative py-2 px-1 text-sm font-medium transition-colors",
                      isActive ? "text-leaf" : "text-gray-500 hover:text-gray-700",
                    )}
                    aria-label={`Navigate to ${label}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {label}
                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-leaf rounded-full" />}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
