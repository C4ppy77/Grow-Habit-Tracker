"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlantStage, stageFromPercent } from "@/components/plant-stage"
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
  completed_date: string // Changed from completed_at to completed_date
  user_id: string
}

interface HabitCalendarProps {
  habits: Habit[]
  completions: Completion[]
  currentDate: Date
  userFlowerType: string
  onDateChange?: (date: Date) => void
}

export default function HabitCalendar({
  habits,
  completions,
  currentDate,
  userFlowerType,
  onDateChange,
}: HabitCalendarProps) {
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    onDateChange?.(newDate)
  }

  const getCompletionPercentage = (dateStr: string): number => {
    console.log("Calculating completion for date:", dateStr)
    console.log("Habits:", habits)
    console.log("Completions:", completions)

    // Handle edge cases that could cause NaN
    if (!habits || habits.length === 0) {
      console.log("No habits found, returning 0")
      return 0
    }

    if (!completions || completions.length === 0) {
      console.log("No completions found, returning 0")
      return 0
    }

    const dayCompletions = completions.filter((completion) => {
      if (!completion || !completion.completed_date) {
        // Changed from completed_at to completed_date
        console.log("Invalid completion:", completion)
        return false
      }

      const completionDate = new Date(completion.completed_date) // Changed from completed_at to completed_date
      const targetDate = new Date(dateStr)

      // Compare year, month, and day separately for more reliable matching
      const matches =
        completionDate.getFullYear() === targetDate.getFullYear() &&
        completionDate.getMonth() === targetDate.getMonth() &&
        completionDate.getDate() === targetDate.getDate()

      if (matches) {
        console.log("Found matching completion:", completion)
      }

      return matches
    })

    const percentage = Math.round((dayCompletions.length / habits.length) * 100)
    console.log(`Date ${dateStr}: ${dayCompletions.length}/${habits.length} = ${percentage}%`)

    // Ensure we return a valid number
    return isNaN(percentage) ? 0 : percentage
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square">
          {/* Empty cell */}
        </div>,
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const completionPercentage = getCompletionPercentage(dateStr)
      const isToday = today.toDateString() === new Date(dateStr).toDateString()
      const isFuture = new Date(dateStr) > today
      const plantStage = stageFromPercent(completionPercentage)

      days.push(
        <div
          key={day}
          className={cn(
            "aspect-square border rounded-lg relative overflow-hidden transition-all duration-300",
            "bg-white shadow-sm hover:shadow-md",
            isToday && "ring-2 ring-green-400 bg-green-50",
            isFuture && "opacity-50",
          )}
        >
          {/* Day number */}
          <div
            className={cn(
              "absolute top-1 left-1 text-xs sm:text-sm font-semibold z-10",
              "bg-white/80 px-1 rounded-sm shadow-sm",
              isToday ? "text-green-700" : isFuture ? "text-gray-400" : "text-gray-800",
            )}
          >
            {day}
          </div>

          {/* Plant stage */}
          {!isFuture && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="scale-[0.35] sm:scale-[0.45] origin-center">
                <PlantStage
                  stage={plantStage}
                  flowerType={userFlowerType as any}
                  showSpecialFlower={completionPercentage === 100}
                />
              </div>
            </div>
          )}

          {/* Completion percentage */}
          {!isFuture && (
            <div
              className={cn(
                "absolute bottom-1 right-1 text-[10px] sm:text-xs font-semibold z-10",
                "bg-white/90 px-1 rounded-sm shadow-sm",
                completionPercentage >= 100
                  ? "text-green-700"
                  : completionPercentage >= 80
                    ? "text-yellow-700"
                    : completionPercentage >= 50
                      ? "text-orange-700"
                      : completionPercentage > 0
                        ? "text-blue-600"
                        : "text-gray-500",
              )}
            >
              {completionPercentage}%
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader className="p-2 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl md:text-2xl">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
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

        <CardContent className="p-2 sm:p-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-2 sm:mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-xs sm:text-sm font-medium text-gray-600 py-1 sm:py-2 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-2 md:gap-3">{renderCalendarGrid()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
