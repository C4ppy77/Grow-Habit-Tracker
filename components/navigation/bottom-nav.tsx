"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Flower2, UserRound, Package } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/garden", label: "Garden", icon: Flower2 },
  { href: "/seeds", label: "Seeds", icon: Package },
  { href: "/account", label: "Account", icon: UserRound },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe lg:hidden z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[60px] transition-colors",
                isActive ? "text-leaf bg-leaf/5" : "text-gray-500 hover:text-gray-700 active:bg-gray-50",
              )}
              aria-label={`Navigate to ${label}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
