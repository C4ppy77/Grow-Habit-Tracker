"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

interface Habit {
  id: string
  name: string
}

interface HabitListProps {
  habits: Habit[]
  completions: Record<string, boolean>
  onToggle: (habitId: string, completed: boolean) => void
  date: string
  className?: string
}

export default function HabitList({ habits, completions, onToggle, date, className = "" }: HabitListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const completedCount = habits.filter((habit) => completions[habit.id] === true).length
  const totalHabits = habits.length
  const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Today's Checklist</CardTitle>
          <div className="text-sm font-medium text-leaf">
            {completedCount}/{totalHabits} ({percentage}%)
          </div>
        </div>
        <p className="text-sm text-gray-600">{formatDate(date)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {habits.map((habit) => {
          const isCompleted = completions[habit.id] || false
          return (
            <div
              key={habit.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => onToggle(habit.id, !isCompleted)}
            >
              <span
                className={`font-medium transition-all duration-200 ${
                  isCompleted ? "text-gray-500 line-through" : "text-gray-900 group-hover:text-gray-700"
                }`}
              >
                {habit.name}
              </span>

              {/* Green checkmark button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle(habit.id, !isCompleted)
                }}
                className={`
                  w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200
                  ${isCompleted ? "bg-leaf border-leaf text-white" : "border-gray-300 hover:border-leaf/60 bg-white"}
                `}
                aria-label={`Mark "${habit.name}" as ${isCompleted ? "incomplete" : "complete"}`}
              >
                {isCompleted && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </button>
            </div>
          )
        })}

        {habits.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No habits yet!</p>
            <p className="text-sm">Add some habits in your Account to get started.</p>
          </div>
        )}

        {/* Progress indicator */}
        {habits.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Daily Progress</span>
              <span className={`font-medium ${percentage === 100 ? "text-leaf" : "text-gray-700"}`}>
                {completedCount}/{totalHabits} habits ({percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  percentage === 100 ? "bg-leaf" : "bg-leaf/70"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
