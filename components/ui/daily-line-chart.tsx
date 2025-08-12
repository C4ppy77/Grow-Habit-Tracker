"use client"

import { useEffect, useState } from "react"

type DailyLineChartProps = {
  labels?: string[]
  values?: number[]
}

export default function DailyLineChart({ labels = [], values = [] }: DailyLineChartProps) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Transform the data
  const chartData = labels.map((label, index) => ({
    day: Number.parseInt(label),
    progress: values[index] || 0,
  }))

  const createBarChart = () => {
    const width = 900
    const height = 400
    const padding = 60

    const maxDay = 31
    const maxProgress = 100
    const barWidth = ((width - 2 * padding) / maxDay) * 0.6

    // Generate all 31 days for X-axis
    const allDays = Array.from({ length: 31 }, (_, i) => i + 1)

    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-2 sm:p-4">
        <svg
          width="100%"
          height="350"
          className="h-96 sm:h-[400px] md:h-[450px] lg:h-[400px]"
          viewBox={`0 0 ${width} ${height}`}
          style={{ minHeight: "384px" }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="30" height="25" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 25" fill="none" stroke="#f3f4f6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = height - padding - (val / 100) * (height - 2 * padding)
            return (
              <g key={val}>
                <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="#9CA3AF" strokeWidth="1" />
                <text x={padding - 10} y={y + 4} textAnchor="end" fill="#6B7280" fontSize="14">
                  {val}%
                </text>
              </g>
            )
          })}

          {/* X-axis labels - Show every 5th day + day 1 and 31 */}
          {allDays
            .filter((day) => day === 1 || day === 31 || day % 5 === 0)
            .map((day) => {
              const x = padding + ((day - 1) / (maxDay - 1)) * (width - 2 * padding)
              return (
                <g key={day}>
                  <line
                    x1={x}
                    y1={height - padding}
                    x2={x}
                    y2={height - padding + 5}
                    stroke="#9CA3AF"
                    strokeWidth="1"
                  />
                  <text x={x} y={height - padding + 18} textAnchor="middle" fill="#6B7280" fontSize="14">
                    {day}
                  </text>
                </g>
              )
            })}

          {/* Light grid lines for all days */}
          {allDays.map((day) => {
            const x = padding + ((day - 1) / (maxDay - 1)) * (width - 2 * padding)
            return (
              <line
                key={`grid-${day}`}
                x1={x}
                y1={padding}
                x2={x}
                y2={height - padding}
                stroke="#f3f4f6"
                strokeWidth="1"
                opacity="0.5"
              />
            )
          })}

          {/* Bars for days with data */}
          {chartData.map((d) => {
            const x = padding + ((d.day - 1) / (maxDay - 1)) * (width - 2 * padding) - barWidth / 2
            const barHeight = (d.progress / maxProgress) * (height - 2 * padding)
            const y = height - padding - barHeight

            return (
              <g key={d.day}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#22c55e"
                  stroke="#ffffff"
                  strokeWidth="1"
                  rx="2"
                  className="cursor-pointer"
                >
                  <title>
                    Day {d.day}: {d.progress}%
                  </title>
                </rect>
              </g>
            )
          })}

          {/* Future days - light gray bars at bottom */}
          {allDays
            .filter((day) => !chartData.some((d) => d.day === day))
            .map((day) => {
              const x = padding + ((day - 1) / (maxDay - 1)) * (width - 2 * padding) - barWidth / 2
              const y = height - padding - 5

              return (
                <rect
                  key={`future-${day}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={5}
                  fill="#e5e7eb"
                  stroke="#f3f4f6"
                  strokeWidth="1"
                  rx="2"
                />
              )
            })}

          {/* Axes */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#9CA3AF" strokeWidth="2" />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#9CA3AF"
            strokeWidth="2"
          />

          {/* Axis labels */}
          <text
            x={isMobile ? 8 : 12}
            y={height / 2}
            textAnchor="middle"
            fill="#6B7280"
            fontSize={isMobile ? "14" : "16"}
            transform={`rotate(-90 ${isMobile ? 8 : 12} ${height / 2})`}
          >
            Completion %
          </text>
          <text x={width / 2} y={height - 10} textAnchor="middle" fill="#6B7280" fontSize={isMobile ? "14" : "16"}>
            Day of Month
          </text>
        </svg>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span>Completed Days ({chartData.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
            <span>Future Days</span>
          </div>
        </div>
      </div>
    )
  }

  // Create SVG chart with 31-day axis
  const createSVGChart = () => {
    const width = 900
    const height = 400
    const padding = 60

    const maxDay = 31 // Always show full month
    const maxProgress = 100

    // Calculate points for the line (only for days with data)
    const points = chartData.map((d) => {
      const x = padding + ((d.day - 1) / (maxDay - 1)) * (width - 2 * padding)
      const y = height - padding - (d.progress / maxProgress) * (height - 2 * padding)
      return { x, y, progress: d.progress, day: d.day }
    })

    const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

    // Generate all 31 days for X-axis
    const allDays = Array.from({ length: 31 }, (_, i) => i + 1)

    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-2 sm:p-4">
        <svg
          width="100%"
          height="350"
          className="h-96 sm:h-[400px] md:h-[450px] lg:h-[400px]"
          viewBox={`0 0 ${width} ${height}`}
          style={{ minHeight: "384px" }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="30" height="25" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 25" fill="none" stroke="#f3f4f6" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = height - padding - (val / 100) * (height - 2 * padding)
            return (
              <g key={val}>
                <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="#9CA3AF" strokeWidth="1" />
                <text x={padding - 10} y={y + 4} textAnchor="end" fill="#6B7280" fontSize="14">
                  {val}%
                </text>
              </g>
            )
          })}

          {/* X-axis labels - Show every 5th day + day 1 and 31 */}
          {allDays
            .filter((day) => day === 1 || day === 31 || day % 5 === 0)
            .map((day) => {
              const x = padding + ((day - 1) / (maxDay - 1)) * (width - 2 * padding)
              return (
                <g key={day}>
                  <line
                    x1={x}
                    y1={height - padding}
                    x2={x}
                    y2={height - padding + 5}
                    stroke="#9CA3AF"
                    strokeWidth="1"
                  />
                  <text x={x} y={height - padding + 18} textAnchor="middle" fill="#6B7280" fontSize="14">
                    {day}
                  </text>
                </g>
              )
            })}

          {/* Light grid lines for all days */}
          {allDays.map((day) => {
            const x = padding + ((day - 1) / (maxDay - 1)) * (width - 2 * padding)
            return (
              <line
                key={`grid-${day}`}
                x1={x}
                y1={padding}
                x2={x}
                y2={height - padding}
                stroke="#f3f4f6"
                strokeWidth="1"
                opacity="0.5"
              />
            )
          })}

          {/* Main green line - only connect days with data */}
          {points.length > 1 && (
            <path
              d={pathData}
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points - green dots for days with data */}
          {points.map((p) => (
            <g key={p.day}>
              <circle cx={p.x} cy={p.y} r="6" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
              {/* Invisible hover area */}
              <circle cx={p.x} cy={p.y} r="15" fill="transparent" className="cursor-pointer">
                <title>
                  Day {p.day}: {p.progress}%
                </title>
              </circle>
            </g>
          ))}

          {/* Future days - light gray dots */}
          {allDays
            .filter((day) => !chartData.some((d) => d.day === day))
            .map((day) => {
              const x = padding + ((day - 1) / (maxDay - 1)) * (width - 2 * padding)
              const y = height - padding // Bottom line
              return (
                <circle key={`future-${day}`} cx={x} cy={y} r="3" fill="#e5e7eb" stroke="#f3f4f6" strokeWidth="1" />
              )
            })}

          {/* Axes */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#9CA3AF" strokeWidth="2" />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#9CA3AF"
            strokeWidth="2"
          />

          {/* Axis labels */}
          <text
            x={isMobile ? 8 : 12}
            y={height / 2}
            textAnchor="middle"
            fill="#6B7280"
            fontSize={isMobile ? "14" : "16"}
            transform={`rotate(-90 ${isMobile ? 8 : 12} ${height / 2})`}
          >
            Completion %
          </text>
          <text x={width / 2} y={height - 10} textAnchor="middle" fill="#6B7280" fontSize={isMobile ? "14" : "16"}>
            Day of Month
          </text>
        </svg>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Completed Days ({chartData.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span>Future Days</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-0.5 bg-green-500"></div>
            <span>Progress Trend</span>
          </div>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="h-96 sm:h-[400px] md:h-[450px] lg:h-[400px] w-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading chart...</p>
      </div>
    )
  }

  return <div className="w-full">{isMobile ? createBarChart() : createSVGChart()}</div>
}
