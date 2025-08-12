"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, ArrowRight, User, Target } from "lucide-react"
import { createProfile, createHabit } from "@/lib/database"
import { useAuth } from "@/hooks/use-auth"

interface OnboardingFlowProps {
  onComplete: () => void
}

const SUGGESTED_HABITS = [
  "Wake up by 7am",
  "Make bed",
  "Exercise for 30 minutes",
  "Read for 20 minutes",
  "Meditate for 10 minutes",
  "Drink 8 glasses of water",
  "Write in journal",
  "Take vitamins",
  "Walk 10,000 steps",
  "No phone 1 hour before bed",
  "Eat a healthy breakfast",
  "Practice gratitude",
]

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState("")
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  const [customHabits, setCustomHabits] = useState<string[]>([])
  const [newCustomHabit, setNewCustomHabit] = useState("")
  const [loading, setLoading] = useState(false)

  const totalHabits = selectedHabits.length + customHabits.length
  const canProceed = step === 1 ? displayName.trim().length > 0 : totalHabits >= 3

  const handleNameSubmit = () => {
    if (displayName.trim()) {
      setStep(2)
    }
  }

  const toggleHabit = (habit: string) => {
    setSelectedHabits((prev) => (prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]))
  }

  const addCustomHabit = () => {
    const habit = newCustomHabit.trim()
    if (habit && !customHabits.includes(habit) && !selectedHabits.includes(habit)) {
      setCustomHabits((prev) => [...prev, habit])
      setNewCustomHabit("")
    }
  }

  const removeCustomHabit = (habit: string) => {
    setCustomHabits((prev) => prev.filter((h) => h !== habit))
  }

  const handleComplete = async () => {
    if (!user || totalHabits < 3) return

    setLoading(true)

    try {
      // Create profile
      await createProfile(user.id, user.email || "", displayName.trim())

      // Create habits
      const allHabits = [...selectedHabits, ...customHabits]
      for (let i = 0; i < allHabits.length; i++) {
        await createHabit(user.id, allHabits[i], i)
      }

      onComplete()
    } catch (error) {
      console.error("Error completing onboarding:", error)
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-bgsoft flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🌱</div>
            <CardTitle className="text-2xl text-leaf">Welcome to GROW!</CardTitle>
            <p className="text-gray-600">Let's get you started on your habit journey</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-leaf mb-3">
                <User className="h-5 w-5" />
                <span className="font-medium">What should we call you?</span>
              </div>
              <Input
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                className="h-12 text-lg"
                autoFocus
              />
              <p className="text-sm text-gray-500">This will be displayed in your profile and can be changed later.</p>
            </div>

            <Button
              onClick={handleNameSubmit}
              disabled={!displayName.trim()}
              className="w-full h-12 bg-leaf hover:bg-leaf/90"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bgsoft flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🎯</div>
          <CardTitle className="text-2xl text-leaf">Choose Your Habits</CardTitle>
          <p className="text-gray-600">Select at least 3 habits to track. You can always add more later!</p>
          <div className="mt-2">
            <span className={`text-sm font-medium ${totalHabits >= 3 ? "text-leaf" : "text-gray-500"}`}>
              {totalHabits}/3 minimum selected
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Suggested Habits */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-gray-700">
              <Target className="h-4 w-4" />
              <span className="font-medium">Popular Habits</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_HABITS.map((habit) => (
                <div
                  key={habit}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedHabits.includes(habit)
                      ? "bg-leaf/10 border-leaf/30"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleHabit(habit)}
                >
                  <Checkbox
                    checked={selectedHabits.includes(habit)}
                    onCheckedChange={() => toggleHabit(habit)}
                    className="data-[state=checked]:bg-leaf data-[state=checked]:border-leaf"
                  />
                  <span className="text-sm font-medium">{habit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Habits */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-gray-700">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add Your Own</span>
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder="e.g., Practice piano for 15 minutes"
                value={newCustomHabit}
                onChange={(e) => setNewCustomHabit(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomHabit()}
                className="flex-1"
              />
              <Button
                onClick={addCustomHabit}
                disabled={!newCustomHabit.trim()}
                variant="outline"
                className="border-leaf text-leaf hover:bg-leaf/5 bg-transparent"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {customHabits.length > 0 && (
              <div className="space-y-2">
                {customHabits.map((habit) => (
                  <div
                    key={habit}
                    className="flex items-center justify-between p-3 bg-leaf/10 border border-leaf/30 rounded-lg"
                  >
                    <span className="text-sm font-medium">{habit}</span>
                    <Button
                      onClick={() => removeCustomHabit(habit)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!canProceed || loading}
              className="flex-1 bg-leaf hover:bg-leaf/90"
            >
              {loading ? "Setting up..." : "Start Growing! 🌱"}
            </Button>
          </div>

          {totalHabits < 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Select at least 3 habits</strong> to get started. Research shows that starting with a few
                focused habits leads to better long-term success!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
