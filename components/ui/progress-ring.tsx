"use client"

import { useEffect, useState } from "react"

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  completed: number
  total: number
  className?: string
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  completed,
  total,
  className = "",
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  // Calculate exact percentage to match the habit list
  const exactPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(exactPercentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [exactPercentage])

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-500 ease-out ${exactPercentage === 100 ? "text-leaf" : "text-leaf/80"}`}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-900">
          {completed}/{total}
        </div>
        <div className={`text-sm font-medium ${exactPercentage === 100 ? "text-leaf" : "text-gray-500"}`}>
          {exactPercentage}%
        </div>
      </div>
    </div>
  )
}
