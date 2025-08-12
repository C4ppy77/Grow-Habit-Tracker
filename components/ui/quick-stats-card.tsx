"use client"

interface QuickStatsCardProps {
  icon: string
  value: number
  label: string
  color: string
  className?: string
}

export default function QuickStatsCard({ icon, value, label, color, className = "" }: QuickStatsCardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className={`text-2xl font-bold ${color} h-8 flex items-center`}>{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  )
}
