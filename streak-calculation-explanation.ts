// Current streak calculation from app/home/page.tsx
function calculateStreaks(
  data: Record<string, any>, // All months of data
  habits: any[],
  currentMonthKey: string,
  todayIndex: number,
) {
  // Declare MonthData and Habit types or import them
  type MonthData = Record<number, boolean[]>
  type Habit = { id: string }

  // Declare getDaysInMonth function or import it
  function getDaysInMonth(monthKey: string): number {
    const [year, month] = monthKey.split("-").map(Number)
    return new Date(year, month + 1, 0).getDate()
  }

  // Get all month keys and sort them chronologically
  const monthKeys = Object.keys(data).sort()

  // Build a flat array of daily completion data
  const dailyCompletions: { date: string; percent: number; isComplete: boolean }[] = []

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
      const isComplete = completedCount > 0 // ⚠️ KEY POINT: Any habit completed = streak continues

      dailyCompletions.push({
        date: `${monthKey}-${String(dayIdx + 1).padStart(2, "0")}`,
        percent,
        isComplete,
      })
    }
  }

  // Calculate current streak (consecutive days with ≥1 habit completed)
  let currentStreak = 0
  for (let i = dailyCompletions.length - 1; i >= 0; i--) {
    if (dailyCompletions[i].isComplete) {
      currentStreak++
    } else {
      break // Streak broken
    }
  }

  // Calculate best streak ever
  let bestStreak = 0
  let tempStreak = 0
  for (const day of dailyCompletions) {
    if (day.isComplete) {
      tempStreak++
      bestStreak = Math.max(bestStreak, tempStreak)
    } else {
      tempStreak = 0 // Reset on any day with 0 habits
    }
  }

  // Calculate perfect days this month
  const perfectDaysThisMonth = dailyCompletions.filter((day) => day.percent === 100).length

  return { currentStreak, bestStreak, perfectDaysThisMonth }
}
