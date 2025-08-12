"use client"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, CalendarDays, ArrowRight } from "lucide-react"
import DailyLineChart from "./daily-line-chart"
import { PlantStage, stageFromPercent } from "./plant-stage"
import { cn } from "@/lib/utils"
import TodayQuickList from "./today-quick-list"

type Habit = { id: string; name: string }
type MonthData = Record<string, boolean[]> // habitId -> [days]
type AppState = { habits: Habit[]; data: Record<string, MonthData> } // "YYYY-MM" -> MonthData

const STORAGE_KEY = "flower-habit-tracker:v1"
const DEFAULT_HABITS: Habit[] = [
  { id: "h1", name: "Wake up by 7am" },
  { id: "h2", name: "Make bed" },
  { id: "h3", name: "Tidy up apartment" },
  { id: "h4", name: "No phone 1 hour AM" },
  { id: "h5", name: "Gym" },
]

function pad2(n: number) {
  return n.toString().padStart(2, "0")
}
function monthKeyFrom(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}
function getDaysInMonth(key: string) {
  const [y, m] = key.split("-").map(Number)
  return new Date(y, m, 0).getDate()
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleString(undefined, { month: "long", year: "numeric" })
}
function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppState
  } catch {
    return null
  }
}
function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}
function ensureMonthForHabits(data: AppState["data"], key: string, habits: Habit[]) {
  const days = getDaysInMonth(key)
  const month = (data[key] = data[key] ?? {})
  for (const h of habits) {
    const arr = month[h.id]
    if (!arr) {
      month[h.id] = Array.from({ length: days }, () => false)
    } else if (arr.length !== days) {
      month[h.id] = Array.from({ length: days }, (_, i) => arr[i] ?? false)
    }
  }
  for (const existingId of Object.keys(month)) {
    if (!habits.find((h) => h.id === existingId)) delete month[existingId]
  }
}
function daysArray(n: number) {
  return Array.from({ length: n }, (_, i) => i + 1)
}

// Calculate streaks from habit data
function calculateStreaks(
  data: Record<string, MonthData>,
  habits: Habit[],
  currentMonthKey: string,
  todayIndex: number,
) {
  // Get all month keys and sort them chronologically
  const monthKeys = Object.keys(data).sort()

  // Build a flat array of daily completion data
  const dailyCompletions: { date: string; percent: number; hasAnyHabit: boolean }[] = []

  for (const monthKey of monthKeys) {
    const monthData = data[monthKey]
    const daysInMonth = getDaysInMonth(monthKey)

    for (let dayIdx = 0; dayIdx < daysInMonth; dayIdx++) {
      // Skip future days
      if (monthKey === currentMonthKey && dayIdx > todayIndex) continue

      let completedCount = 0
      for (const habit of habits) {
        if (monthData[habit.id]?.[dayIdx]) completedCount++
      }

      const percent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0
      const hasAnyHabit = completedCount > 0 // KEY: Any habit completed = streak continues

      dailyCompletions.push({
        date: `${monthKey}-${String(dayIdx + 1).padStart(2, "0")}`,
        percent,
        hasAnyHabit,
      })
    }
  }

  // Calculate current streak (consecutive days with ≥1 habit completed)
  let currentStreak = 0
  for (let i = dailyCompletions.length - 1; i >= 0; i--) {
    if (dailyCompletions[i].hasAnyHabit) {
      currentStreak++
    } else {
      break // Streak broken - reset to 0
    }
  }

  // Calculate best streak ever
  let bestStreak = 0
  let tempStreak = 0
  for (const day of dailyCompletions) {
    if (day.hasAnyHabit) {
      tempStreak++
      bestStreak = Math.max(bestStreak, tempStreak)
    } else {
      tempStreak = 0 // Reset streak when no habits completed
    }
  }

  // Ensure best streak is at least as high as current streak
  bestStreak = Math.max(bestStreak, currentStreak)

  // Calculate perfect days this month (100% completion)
  const currentMonthData = data[currentMonthKey] || {}
  const currentMonthDays = Math.min(getDaysInMonth(currentMonthKey), todayIndex + 1)
  let perfectDaysThisMonth = 0

  for (let dayIdx = 0; dayIdx < currentMonthDays; dayIdx++) {
    let completedCount = 0
    for (const habit of habits) {
      if (currentMonthData[habit.id]?.[dayIdx]) completedCount++
    }
    if (habits.length > 0 && completedCount === habits.length) {
      perfectDaysThisMonth++
    }
  }

  return { currentStreak, bestStreak, perfectDaysThisMonth }
}

// Helper function to check if a month is in the future
function isMonthInFuture(monthKey: string, today: Date): boolean {
  const [year, month] = monthKey.split("-").map(Number)
  const monthDate = new Date(year, month - 1, 1)
  const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  return monthDate > todayMonth
}

// Helper function to check if a day is in the future
function isDayInFuture(dayIndex: number, monthKey: string, today: Date): boolean {
  const [year, month] = monthKey.split("-").map(Number)
  const dayDate = new Date(year, month - 1, dayIndex + 1)
  return dayDate > today
}

export default function FlowerHabitTracker() {
  const [state, setState] = useState<AppState>({ habits: DEFAULT_HABITS, data: {} })
  const [selectedMonth, setSelectedMonth] = useState<string>("2025-01") // Start at January 2025
  const [newHabit, setNewHabit] = useState("")
  const [markTodayOnAdd, setMarkTodayOnAdd] = useState(false)

  const today = new Date()
  const todayKey = monthKeyFrom(today)
  const isCurrentMonth = selectedMonth === todayKey
  const todayIndex = isCurrentMonth ? today.getDate() - 1 : -1

  // Load
  useEffect(() => {
    const s = loadState()
    if (s) {
      setState(s)
      if (!s.data[selectedMonth]) {
        const clone = structuredClone(s)
        ensureMonthForHabits(clone.data, selectedMonth, clone.habits)
        setState(clone)
      }
    } else {
      const init: AppState = { habits: DEFAULT_HABITS, data: {} }
      ensureMonthForHabits(init.data, selectedMonth, init.habits)
      setState(init)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ensure structure on month/habits change
  useEffect(() => {
    setState((prev) => {
      const clone = structuredClone(prev) as AppState
      ensureMonthForHabits(clone.data, selectedMonth, clone.habits)
      return clone
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, state.habits.length])

  // Persist
  useEffect(() => {
    saveState(state)
  }, [state])

  const days = getDaysInMonth(selectedMonth)
  const dayNumbers = useMemo(() => daysArray(days), [days])
  const monthData = state.data[selectedMonth] ?? {}

  const totalsPerDay = useMemo(() => {
    const totals: number[] = Array.from({ length: days }, () => 0)
    for (const h of state.habits) {
      const arr = monthData[h.id] ?? []
      arr.forEach((v, i) => {
        if (v) totals[i] += 1
      })
    }
    return totals
  }, [days, monthData, state.habits])

  const percentPerDay = useMemo(() => {
    const totalHabits = state.habits.length
    if (totalHabits === 0) return Array.from({ length: days }, () => 0)
    return totalsPerDay.map((c) => Math.round((c / totalHabits) * 100))
  }, [totalsPerDay, days, state.habits.length])

  const todayCompleted = todayIndex >= 0 ? (totalsPerDay[todayIndex] ?? 0) : 0
  const todayPercent = todayIndex >= 0 ? (percentPerDay[todayIndex] ?? 0) : 0

  const weeklyPercents = useMemo(() => {
    const buckets = [
      percentPerDay.slice(0, Math.min(7, days)),
      percentPerDay.slice(7, Math.min(14, days)),
      percentPerDay.slice(14, Math.min(21, days)),
      percentPerDay.slice(21, days),
    ]
    return buckets.map((b) => (b.length ? Math.round(b.reduce((a, c) => a + c, 0) / b.length) : 0))
  }, [percentPerDay, days])

  function toggle(habitId: string, dayIdx: number, value: boolean) {
    // Don't allow toggling future days
    if (isDayInFuture(dayIdx, selectedMonth, today)) return

    setState((prev) => {
      const clone = structuredClone(prev) as AppState
      ensureMonthForHabits(clone.data, selectedMonth, clone.habits)
      clone.data[selectedMonth][habitId][dayIdx] = value
      return clone
    })
  }

  function toggleToday(habitId: string, value: boolean) {
    if (!isCurrentMonth || todayIndex < 0) return
    toggle(habitId, todayIndex, value)
  }

  function addHabit() {
    const name = newHabit.trim()
    if (!name) return
    const habit: Habit = { id: crypto.randomUUID(), name }
    setState((prev) => {
      const clone = structuredClone(prev) as AppState
      clone.habits.push(habit)
      const months = new Set<string>([selectedMonth, ...Object.keys(clone.data)])
      months.forEach((key) => ensureMonthForHabits(clone.data, key, clone.habits))
      // Mark today if requested
      if (markTodayOnAdd && isCurrentMonth && todayIndex >= 0) {
        clone.data[selectedMonth][habit.id][todayIndex] = true
      }
      return clone
    })
    setNewHabit("")

    // Visual feedback when today is marked complete
    if (markTodayOnAdd && isCurrentMonth && todayIndex >= 0) {
      setTimeout(() => {
        const todayCol = document.querySelector(`[data-day-header="${todayIndex}"]`)
        if (todayCol) {
          todayCol.classList.add("ring-2", "ring-emerald-400", "ring-offset-1")
          setTimeout(() => {
            todayCol.classList.remove("ring-2", "ring-emerald-400", "ring-offset-1")
          }, 1500)
        }
      }, 100)
    }
  }

  function renameHabit(id: string, name: string) {
    setState((prev) => {
      const clone = structuredClone(prev) as AppState
      const h = clone.habits.find((x) => x.id === id)
      if (h) h.name = name
      return clone
    })
  }

  function removeHabit(id: string) {
    setState((prev) => {
      const clone = structuredClone(prev) as AppState
      clone.habits = clone.habits.filter((h) => h.id !== id)
      for (const key of Object.keys(clone.data)) delete clone.data[key][id]
      return clone
    })
  }

  const monthOptions = useMemo(() => {
    const options: string[] = []
    const startDate = new Date(2025, 0, 1) // January 2025
    const endDate = new Date(today.getFullYear() + 2, 11, 31) // 2 years in future

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const monthKey = `${currentDate.getFullYear()}-${pad2(currentDate.getMonth() + 1)}`
      options.push(monthKey)
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    return options
  }, [today])

  // Auto-scroll to today on current month
  useEffect(() => {
    if (!isCurrentMonth || todayIndex < 0) return
    const el = document.querySelector<HTMLElement>(`[data-day-header="${todayIndex}"]`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [isCurrentMonth, todayIndex, selectedMonth])

  function scrollToToday() {
    // First switch to current month if not already there
    if (selectedMonth !== todayKey) {
      setSelectedMonth(todayKey)
      // The useEffect will handle scrolling after month change
      return
    }

    // Already on current month, just scroll
    if (todayIndex >= 0) {
      const el = document.querySelector<HTMLElement>(`[data-day-header="${todayIndex}"]`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
        el.classList.add("ring-2", "ring-emerald-400")
        setTimeout(() => el.classList.remove("ring-2", "ring-emerald-400"), 800)
      }
    }
  }

  const todayValues: Record<string, boolean> = useMemo(() => {
    if (!isCurrentMonth || todayIndex < 0) return {}
    const map: Record<string, boolean> = {}
    for (const h of state.habits) {
      map[h.id] = !!monthData[h.id]?.[todayIndex]
    }
    return map
  }, [isCurrentMonth, todayIndex, monthData, state.habits])

  return (
    <main className="min-h-screen bg-pink-50">
      {/* Sticky header + growth */}
      <div className="sticky top-0 z-40 border-b bg-pink-50/95 backdrop-blur">
        <header className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Flower Habit Tracker</h1>
              <p className="text-sm text-slate-600">Grow flowers as you complete your tasks!</p>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-slate-500" aria-hidden="true" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[170px] bg-white">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((k) => {
                    const isFuture = isMonthInFuture(k, today)
                    return (
                      <SelectItem key={k} value={k} disabled={isFuture} className={cn(isFuture && "text-slate-400")}>
                        {monthLabel(k)}
                        {isFuture && " (locked)"}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Today banner */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                Today
              </span>
              <span className="text-sm font-medium text-slate-800" aria-live="polite">
                {today.toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {isCurrentMonth && (
                <span className="text-sm text-slate-600">
                  • {todayCompleted}/{state.habits.length} done ({todayPercent}%)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToToday}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                Jump to today
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Growth section */}
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:pb-4">
          <Card className="border-0 bg-pink-100">
            <CardContent className="pt-4">
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {weeklyPercents.map((p, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <PlantStage stage={stageFromPercent(p)} label={`Week ${i + 1}`} showSpecialFlower={p >= 100} />
                    <span className="mt-1 text-xs text-slate-600">{p}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile quick list */}
      <div className="mx-auto max-w-6xl px-4 pt-3">
        {isCurrentMonth && (
          <TodayQuickList
            habits={state.habits}
            todayValues={todayValues}
            onToggle={toggleToday}
            dateLabel={today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          />
        )}
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Daily Habits for {monthLabel(selectedMonth)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add habit */}
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Add a new habit"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
                className="bg-white max-w-sm"
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="mark-today"
                  checked={markTodayOnAdd}
                  onCheckedChange={(v) => setMarkTodayOnAdd(!!v)}
                  disabled={!isCurrentMonth}
                />
                <label htmlFor="mark-today" className="text-sm text-slate-700 select-none">
                  {isCurrentMonth
                    ? `Auto-check for today (${today.getDate()})`
                    : "Mark today complete (only on current month)"}
                </label>
              </div>
              <Button onClick={addHabit} className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="mr-2 size-4" />
                Add
              </Button>
            </div>

            {/* Frozen table structure */}
            <div className="overflow-hidden rounded-md border bg-white">
              <div className="relative overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Header row - sticky top */}
                  <div className="sticky top-0 z-20 flex border-b bg-rose-50/95 backdrop-blur">
                    <div className="sticky left-0 z-30 flex h-12 w-44 shrink-0 items-center justify-center border-r bg-rose-50 text-xs font-semibold uppercase text-slate-600 shadow-sm">
                      Habits
                    </div>
                    {dayNumbers.map((d, i) => {
                      const isTodayCol = i === todayIndex
                      const isFutureDay = isDayInFuture(i, selectedMonth, today)
                      return (
                        <div
                          key={`h-${d}`}
                          data-day-header={i}
                          className={cn(
                            "flex h-12 w-14 shrink-0 items-center justify-center text-xs font-semibold",
                            isTodayCol
                              ? "bg-emerald-50 text-emerald-700"
                              : isFutureDay
                                ? "bg-slate-100 text-slate-400"
                                : "text-slate-700",
                          )}
                        >
                          {d}
                        </div>
                      )
                    })}
                  </div>

                  {/* Habit rows */}
                  {state.habits.map((h) => {
                    const arr = monthData[h.id] ?? Array.from({ length: days }, () => false)
                    return (
                      <div key={h.id} className="flex border-b">
                        <div className="sticky left-0 z-10 flex h-12 w-44 shrink-0 items-center gap-1 border-r bg-white px-2 shadow-sm">
                          <Input
                            value={h.name}
                            onChange={(e) => renameHabit(h.id, e.target.value)}
                            className="h-8 border-0 px-2 text-sm focus-visible:ring-0"
                            aria-label={`Rename habit ${h.name}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                            onClick={() => removeHabit(h.id)}
                            aria-label={`Delete ${h.name}`}
                            title="Remove habit"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        {dayNumbers.map((d, i) => {
                          const isTodayCol = i === todayIndex
                          const isFutureDay = isDayInFuture(i, selectedMonth, today)
                          const checked = !!arr[i]
                          return (
                            <div
                              key={`${h.id}-${d}`}
                              className={cn(
                                "group flex h-12 w-14 shrink-0 items-center justify-center transition-colors select-none",
                                i % 7 === 6 ? "bg-rose-50/50" : "bg-white",
                                isTodayCol && "bg-emerald-50/70",
                                isFutureDay && "bg-slate-50 cursor-not-allowed",
                              )}
                              onClick={(e) => {
                                if (isFutureDay) return
                                const box = (e.target as HTMLElement).closest('[role="checkbox"]')
                                if (!box) toggle(h.id, i, !checked)
                              }}
                              style={{ touchAction: isFutureDay ? "none" : "manipulation" }}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(val) => !isFutureDay && toggle(h.id, i, !!val)}
                                disabled={isFutureDay}
                                className={cn(
                                  "size-6 border-2 transition-transform",
                                  !isFutureDay && "group-hover:scale-110 active:scale-95",
                                  "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500",
                                  isTodayCol && !isFutureDay && "ring-1 ring-emerald-300",
                                  isFutureDay && "opacity-30 cursor-not-allowed",
                                )}
                                aria-label={isFutureDay ? `${h.name} on day ${d} (locked)` : `${h.name} on day ${d}`}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}

                  {/* Completed row */}
                  <div className="flex border-t bg-rose-50">
                    <div className="sticky left-0 z-10 flex h-10 w-44 shrink-0 items-center justify-center border-r bg-rose-50 text-xs font-medium text-slate-700 shadow-sm">
                      Completed
                    </div>
                    {dayNumbers.map((d, i) => {
                      const isFutureDay = isDayInFuture(i, selectedMonth, today)
                      return (
                        <div
                          key={`c-${d}`}
                          className={cn(
                            "flex h-10 w-14 shrink-0 items-center justify-center text-xs font-medium",
                            i === todayIndex ? "text-emerald-700" : isFutureDay ? "text-slate-400" : "text-slate-700",
                          )}
                        >
                          {isFutureDay ? "—" : totalsPerDay[i]}
                        </div>
                      )
                    })}
                  </div>

                  {/* Percentage row */}
                  <div className="flex border-t bg-rose-50">
                    <div className="sticky left-0 z-10 flex h-10 w-44 shrink-0 items-center justify-center border-r bg-rose-50 text-[11px] font-semibold text-emerald-700 shadow-sm">
                      % Complete
                    </div>
                    {dayNumbers.map((d, i) => {
                      const isFutureDay = isDayInFuture(i, selectedMonth, today)
                      return (
                        <div
                          key={`p-${d}`}
                          className={cn(
                            "flex h-10 w-14 shrink-0 items-center justify-center text-[11px] font-semibold",
                            isFutureDay ? "text-slate-400" : "text-emerald-700",
                          )}
                        >
                          {isFutureDay ? "—" : `${percentPerDay[i]}%`}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Mobile tip: Use the Today's Checklist above for one-tap updates. Future days are locked until they arrive.
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(() => {
            const stats = calculateStreaks(state.data, state.habits, selectedMonth, todayIndex)
            return (
              <>
                <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🌿</span>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">{stats.currentStreak}</div>
                        <div className="text-sm text-gray-500">Current Streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🌼</span>
                      <div>
                        <div className="text-2xl font-bold text-pink-500">{stats.perfectDaysThisMonth}</div>
                        <div className="text-sm text-gray-500">Perfect Days This Month</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <div className="text-2xl font-bold text-amber-500">{stats.bestStreak}</div>
                        <div className="text-sm text-gray-500">Best Streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )
          })()}
        </div>

        {/* Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Daily Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyLineChart
              labels={dayNumbers.map((d) => d.toString())}
              values={percentPerDay.map((p, i) => (isDayInFuture(i, selectedMonth, today) ? 0 : p))}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
