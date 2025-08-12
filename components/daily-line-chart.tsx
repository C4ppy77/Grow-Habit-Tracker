"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

type DailyLineChartProps = {
  labels?: string[]
  values?: number[]
}

export default function DailyLineChart({ labels = [], values = [] }: DailyLineChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: "Daily % Complete",
        data: values,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart
          const { ctx: c, chartArea } = chart
          if (!chartArea) return "rgba(34,197,94,0.2)"
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, "rgba(34,197,94,0.35)")
          gradient.addColorStop(1, "rgba(34,197,94,0.05)")
          return gradient
        },
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        tension: 0.35,
      },
    ],
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 25,
          callback: (value: any) => value + "%",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Day of Month",
          color: "#6B7280",
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `Day ${context.label}: ${context.parsed.y}% complete`,
          title: (context: any) => `Day ${context[0].label}`,
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  }

  return (
    <div className="h-60 sm:h-72">
      <Line data={data} options={options} />
    </div>
  )
}
