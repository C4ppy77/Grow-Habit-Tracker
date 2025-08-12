"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getHabits, getHabitCompletions, toggleHabitCompletion } from "@/lib/database"
import ProgressRing from "@/components/ui/progress-ring"
import QuickStatsCard from "@/components/ui/quick-stats-card"
import HabitList from "@/components/habits/habit-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BrainCircuit } from "lucide-react"
import DailyLineChart from "@/components/ui/daily-line-chart"
import { getAiInsights } from "@/app/actions"

interface Habit {
  id: string
  name: string
  user_id: string
  created_at: string
  is_active: boolean
  order_index: number
}

interface HabitCompletion {
  id: string
  user_id: string
  habit_id: string
  completed_date: string
  created_at: string
  notes: string | null
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [previousMonthCompletions, setPreviousMonthCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [potAiEnabled, setPotAiEnabled] = useState(false)
  const [aiInsight, setAiInsight] = useState("")
  const [aiLoading, setAiLoading] = useState(true)
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-based
  const currentDay = now.getDate()

  const thisMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
  const prevMonth =
    currentMonth === 0 ? `${currentYear - 1}-12` : `${currentYear}-${String(currentMonth).padStart(2, "0")}`

  console.log(`Current date info:`, {
    today,
    currentYear,
    currentMonth: currentMonth + 1, // Display as 1-based
    currentDay,
    thisMonth,
    prevMonth,
    monthName: now.toLocaleDateString("en-US", { month: "long" }),
  })

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/")
      return
    }

    const loadData = async () => {
      setLoading(true)
      const userId = user.id

      const potAiSetting = localStorage.getItem("pot_ai_enabled") === "true"
      setPotAiEnabled(potAiSetting)

      const [habitsResult, completionsResult, prevCompletionsResult] = await Promise.all([
        getHabits(userId),
        getHabitCompletions(userId, `${thisMonth}-01`, `${thisMonth}-31`),
        getHabitCompletions(userId, `${prevMonth}-01`, `${prevMonth}-31`),
      ])

      if (habitsResult.data) setHabits(habitsResult.data)
      if (completionsResult.data) setCompletions(completionsResult.data)
      if (prevCompletionsResult.data) setPreviousMonthCompletions(prevCompletionsResult.data)

      setLoading(false)
    }

    loadData()
  }, [user, authLoading, thisMonth, prevMonth, router])

  useEffect(() => {
    const fetchInsight = async () => {
      if (!loading && potAiEnabled && user) {
        setAiLoading(true)
        const progressPayload = JSON.stringify({
          stats,
          habits,
          todayProgress,
          completedToday,
          totalHabits,
        })
        const result = await getAiInsights(progressPayload)
        if (result.insight) {
          setAiInsight(result.insight)
        } else {
          setAiInsight("Could not get an insight right now, but you're doing great!")
        }
        setAiLoading(false)
      }
    }

    fetchInsight()
  }, [loading, potAiEnabled, user, stats, habits, todayProgress, completedToday, totalHabits])

  const handleToggleHabit = async (habitId: string, completed: boolean) => {
    const userId = user?.id || "demo-user-123"

    if (completed) {
      const newCompletion = {
        id: "temp-" + Date.now(),
        user_id: userId,
        habit_id: habitId,
        completed_date: today,
        created_at: new Date().toISOString(),
        notes: null,
      }
      setCompletions((prev) => [...prev, newCompletion])
    } else {
      setCompletions((prev) => prev.filter((c) => !(c.habit_id === habitId && c.completed_date === today)))
    }

    await toggleHabitCompletion(userId, habitId, today)
  }

  const todayCompletions = completions.filter((c) => c.completed_date === today)
  const todayCompletionMap = todayCompletions.reduce(
    (acc, c) => {
      acc[c.habit_id] = true
      return acc
    },
    {} as Record<string, boolean>,
  )

  const completedToday = habits.filter((habit) => todayCompletionMap[habit.id] === true).length
  const totalHabits = habits.length
  const todayProgress = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0

  const getDailyProgress = () => {
    const dailyData = []

    console.log(`=== DAILY PROGRESS CALCULATION (Garden Method) ===`)
    console.log(`Current day: ${currentDay}`)
    console.log(`Total habits: ${totalHabits}`)
    console.log(`Total completions: ${completions.length}`)

    for (let day = 1; day <= currentDay; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

      const dayCompletions = completions.filter((c) => c.completed_date === dateStr)
      const completionCount = dayCompletions.length
      const dayProgress = totalHabits > 0 ? Math.round((completionCount / totalHabits) * 100) : 0

      dailyData.push({
        day: day,
        progress: dayProgress,
        date: dateStr,
        completions: completionCount,
        totalHabits: totalHabits,
      })

      console.log(`Day ${day} (${dateStr}): ${completionCount}/${totalHabits} = ${dayProgress}% (Garden method)`)
    }

    console.log("=== FINAL DAILY DATA (Should match Garden) ===", dailyData)
    return dailyData
  }

  const dailyProgress = getDailyProgress()

  const calculateStats = () => {
    let currentStreak = 0
    let perfectDays = 0
    let bestStreak = 0

    const allCompletions = [...completions, ...previousMonthCompletions]
    console.log(`=== STREAK CALCULATION DEBUG ===`)
    console.log(`Total completions available:`, allCompletions.length)
    console.log(`Current month completions:`, completions.length)
    console.log(`Previous month completions:`, previousMonthCompletions.length)
    console.log(`Starting from today:`, today)

    const todayDate = new Date(today)
    const checkDate = new Date(todayDate)

    // Work backwards from today to count consecutive days with at least 1 habit completed
    while (currentStreak < 365) {
      // Safety limit
      const dateStr = checkDate.toISOString().split("T")[0]
      const dayCompletions = allCompletions.filter((c) => c.completed_date === dateStr).length

      console.log(`Checking ${dateStr}: ${dayCompletions} completions`)

      if (dayCompletions > 0) {
        // At least 1 habit completed - continue streak
        currentStreak++
        console.log(`  ✅ Streak continues: ${currentStreak}`)
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        // No habits completed - streak breaks
        console.log(`  ❌ Streak breaks at ${dateStr} (0 habits completed)`)
        break
      }
    }

    // Calculate other stats for current month only
    const dailyData = []
    for (let day = 1; day <= currentDay; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayCompletions = completions.filter((c) => c.completed_date === dateStr).length
      const hasAnyHabit = dayCompletions > 0
      const isPerfect = totalHabits > 0 && dayCompletions === totalHabits

      dailyData.push({ day, hasAnyHabit, isPerfect, completions: dayCompletions })
    }

    // Count perfect days and calculate best streak for current month
    let tempCurrentStreak = 0
    for (const day of dailyData) {
      if (day.isPerfect) {
        perfectDays++
      }

      if (day.hasAnyHabit) {
        tempCurrentStreak++
        bestStreak = Math.max(bestStreak, tempCurrentStreak)
      } else {
        tempCurrentStreak = 0
      }
    }

    // Best streak should include the current cross-month streak
    bestStreak = Math.max(bestStreak, currentStreak)

    console.log(`Final streak calculation results:`, {
      currentStreak,
      perfectDays,
      bestStreak,
      totalCompletions: allCompletions.length,
    })

    return { currentStreak, perfectDays, bestStreak }
  }

  const stats = calculateStats()

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-slate-300">
      <div className="max-w-4xl mx-auto p-4 space-y-6">


        <Card>
          <CardContent className="flex flex-col items-center py-8">
            <ProgressRing progress={todayProgress} completed={completedToday} total={totalHabits} className="mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Today's Progress</h2>
            <p className="text-gray-600">
              {completedToday === totalHabits && totalHabits > 0
                ? "Perfect day! All habits completed! 🌟"
                : `${completedToday}/${totalHabits} habits completed - Keep growing! 🌱`}
            </p>
          </CardContent>
        </Card>

        <HabitList habits={habits} completions={todayCompletionMap} onToggle={handleToggleHabit} date={today} />

        <Card>
          <CardHeader>
            <CardTitle>Daily Tracker - {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</CardTitle>
            <p className="text-sm text-gray-600">
              Your daily habit completion progress this month ({dailyProgress.length} days tracked) - Same data as
              Garden view
            </p>
          </CardHeader>
          <CardContent>
            <DailyLineChart
              labels={dailyProgress.map((d) => d.day.toString())}
              values={dailyProgress.map((d) => d.progress)}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Days tracked: {dailyProgress.length} • Average:{" "}
                {dailyProgress.length > 0
                  ? Math.round(dailyProgress.reduce((sum, d) => sum + d.progress, 0) / dailyProgress.length)
                  : 0}
                % • Total completions: {completions.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                💡 This chart shows the same percentages as your Garden calendar flowers
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickStatsCard icon="🌿" value={stats.currentStreak} label="Current Streak" color="text-leaf" />
          <QuickStatsCard icon="🌼" value={stats.perfectDays} label="Perfect Days" color="text-petal" />
          <QuickStatsCard icon="🏆" value={stats.bestStreak} label="Best Perfect Streak" color="text-center" />
        </div>

        {habits.length < 5 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="text-center py-6">
              <div className="text-4xl mb-2">🌱</div>
              <h3 className="font-medium text-gray-900 mb-2">Grow Your Garden</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add more habits to make your garden flourish! You currently have {habits.length} habit
                {habits.length !== 1 ? "s" : ""}.
              </p>
              <Button
                onClick={() => (window.location.href = "/account")}
                variant="outline"
                className="border-leaf text-leaf hover:bg-leaf/5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More Habits
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>POT - Personal Objective Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-2">
                  <img
                    src="/images/pot-logo.png"
                    alt="POT - Personal Objective Tracker Logo"
                    className="w-16 h-16 sm:w-20 sm:h-20"
                  />
                </div>
                {potAiEnabled ? (
                  <>
                    <h3 className="text-lg font-bold text-blue-800">Hey there, {user?.user_metadata.display_name || "habit hero"}! 🌟</h3>
                    <div className="space-y-4 text-sm text-blue-700">
                      <div className="bg-white/70 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <BrainCircuit className="h-4 w-4 mr-2" />
                          POT's Insight
                        </h4>
                        <div className="text-sm text-blue-900">
                          {aiLoading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                              POT is analyzing your progress...
                            </div>
                          ) : (
                            <p>{aiInsight}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/70 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">📊 Your Progress</h4>
                          <p>
                            <strong>Current Streak:</strong> {stats.currentStreak} days{" "}
                            {stats.currentStreak > 0 ? "🔥" : "💪"}
                          </p>
                          <p>
                            <strong>Perfect Days:</strong> {stats.perfectDays} {stats.perfectDays > 0 ? "🌼" : "✨"}
                          </p>
                          <p>
                            <strong>Best Streak:</strong> {stats.bestStreak} days 🏆
                          </p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">🎯 Today's Focus</h4>
                          <p>
                            <strong>Completion Rate:</strong> {Math.round(todayProgress)}%
                          </p>
                          <p>
                            <strong>Habits Left:</strong> {totalHabits - completedToday}
                          </p>
                          <p>
                            <strong>Energy Level:</strong>{" "}
                            {todayProgress > 75 ? "High 🚀" : todayProgress > 50 ? "Good 👍" : "Building 🌱"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Achievements Unlocked</h4>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {stats.currentStreak >= 3 && (
                            <span className="bg-yellow-200 px-2 py-1 rounded">🔥 3-Day Streak</span>
                          )}
                          {stats.perfectDays >= 1 && (
                            <span className="bg-purple-200 px-2 py-1 rounded">⭐ Perfect Day</span>
                          )}
                          {completions.length >= 10 && (
                            <span className="bg-green-200 px-2 py-1 rounded">📈 10 Completions</span>
                          )}
                          {habits.length >= 3 && (
                            <span className="bg-blue-200 px-2 py-1 rounded">🌱 Habit Builder</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-blue-800">POT AI Assistant</h3>
                    <div className="space-y-3 text-sm text-blue-700">
                      <p>Get personalised insights and motivation for your habit journey!</p>
                      <div className="bg-white/70 rounded-lg p-4">
                        <p className="text-xs text-blue-600">
                          Enable POT AI to receive personalised tips, streak analysis, and motivational insights based
                          on your progress.
                        </p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button
                        onClick={() => (window.location.href = "/account")}
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 w-full"
                      >
                        Enable POT AI Assistant
                      </Button>
                      <p className="text-xs text-blue-500 mt-2">
                        Go to accounts to turn on POT AI for personalised insights
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
