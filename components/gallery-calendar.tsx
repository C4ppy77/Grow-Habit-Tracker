"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface Habit {
  id: string
  name: string
  description?: string
  created_at: string
  user_id: string
}

interface Completion {
  id: string
  habit_id: string
  completed_date: string
  user_id: string
}

interface GalleryCalendarProps {
  habits: Habit[]
  completions: Completion[]
  currentDate: Date
  userFlowerType: string
}

const FLOWER_EMOJIS = {
  rose: "🌹",
  sunflower: "🌻",
  tulip: "🌷",
  cherry: "🌸",
  daisy: "🌼",
  lotus: "🪷",
  default: "🌼",
}

const OWNED_FLOWERS = [
  { id: 1, name: "Rose", emoji: "🌹" },
  { id: 2, name: "Sunflower", emoji: "🌻" },
  { id: 3, name: "Tulip", emoji: "🌷" },
  { id: 4, name: "Cherry Blossom", emoji: "🌸" },
  { id: 5, name: "Daisy", emoji: "🌼" },
  { id: 6, name: "Lotus", emoji: "🪷" },
]

function GalleryCalendar({ habits, completions, currentDate, userFlowerType }: GalleryCalendarProps) {
  const [viewDate, setViewDate] = useState(currentDate)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")

  const currentMonth = viewDate.getMonth()
  const currentYear = viewDate.getFullYear()

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(viewDate)
    if (direction === "prev") {
      newDate.setMonth(viewDate.getMonth() - 1)
    } else {
      newDate.setMonth(viewDate.getMonth() + 1)
    }
    setViewDate(newDate)
  }

  const getCompletionPercentage = (dateStr: string): number => {
    if (habits.length === 0) return 0

    const dayCompletions = completions.filter((completion) => {
      const completionDate = new Date(completion.completed_date).toDateString()
      const targetDate = new Date(dateStr).toDateString()
      return completionDate === targetDate
    })

    return Math.round((dayCompletions.length / habits.length) * 100)
  }

  const handleDayClick = (dateStr: string) => {
    const percentage = getCompletionPercentage(dateStr)
    if (percentage === 100) {
      setSelectedDate(dateStr)
      setShowSwapModal(true)
    }
  }

  const handleFlowerSwap = (flowerId: number) => {
    const selectedFlower = OWNED_FLOWERS.find((f) => f.id === flowerId)
    if (selectedFlower) {
      const flowerChoices = JSON.parse(localStorage.getItem("flowerChoices") || "{}")
      flowerChoices[selectedDate] = selectedFlower.name.toLowerCase()
      localStorage.setItem("flowerChoices", JSON.stringify(flowerChoices))

      console.log(`Swapped flower for ${selectedDate} to ${selectedFlower.name}`)
    }
    setShowSwapModal(false)
    setSelectedDate("")
  }

  const getFlowerForDate = (dateStr: string): string => {
    const flowerChoices = JSON.parse(localStorage.getItem("flowerChoices") || "{}")
    return flowerChoices[dateStr] || userFlowerType
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(viewDate)
    const firstDay = getFirstDayOfMonth(viewDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square">
          {/* Empty cell */}
        </div>,
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const completionPercentage = getCompletionPercentage(dateStr)
      const isToday = new Date().toDateString() === new Date(dateStr).toDateString()
      const isFuture = new Date(dateStr) > new Date()
      const isPerfectDay = completionPercentage === 100
      const isClickable = isPerfectDay && !isFuture

      days.push(
        <div
          key={day}
          className={cn(
            "aspect-square border rounded-lg flex items-center justify-center transition-all duration-300 bg-gray-50",
            "shadow-sm bg-yellow-900",
            isToday && "ring-2 ring-green-400 bg-green-50",
            isFuture && "opacity-50",
            isClickable && "cursor-pointer hover:shadow-md hover:scale-105",
            !isClickable && "cursor-default",
          )}
          onClick={() => !isFuture && handleDayClick(dateStr)}
        >
          {isPerfectDay ? (
            <div className="text-3xl sm:text-4xl md:text-6xl" role="img" aria-label="Perfect day bloom">
              {FLOWER_EMOJIS[getFlowerForDate(dateStr) as keyof typeof FLOWER_EMOJIS] || FLOWER_EMOJIS.default}
            </div>
          ) : (
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-dashed border-gray-200 rounded-full opacity-30" />
          )}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl md:text-2xl">
              {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardTitle>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="flex items-center justify-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">{renderCalendarGrid()}</div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm sm:text-base">Gallery Mode</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Showing only perfect days (100% completion) with bloom flowers. Click any bloom to swap flowers from your
              collection!
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSwapModal} onOpenChange={setShowSwapModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-black">Choose Your Flower</DialogTitle>
            <p className="text-sm text-gray-600">Select a flower to display for {selectedDate}</p>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {OWNED_FLOWERS.map((flower) => (
              <Card
                key={flower.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                onClick={() => handleFlowerSwap(flower.id)}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="text-3xl mb-2">{flower.emoji}</div>
                  <h4 className="font-medium text-sm text-slate-500">{flower.name}</h4>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSwapModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GalleryCalendar
