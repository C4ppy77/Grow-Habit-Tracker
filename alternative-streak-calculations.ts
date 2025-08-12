// Option 1: Perfect Streak (100% completion required)
function calculatePerfectStreak(dailyCompletions: any[], totalHabits: number) {
  let currentStreak = 0
  for (let i = dailyCompletions.length - 1; i >= 0; i--) {
    const day = dailyCompletions[i]
    if (day.percent === 100 && totalHabits > 0) {
      currentStreak++
    } else {
      break
    }
  }
  return currentStreak
}

// Option 2: Threshold-based streak (e.g., 80%+ completion)
function calculateThresholdStreak(dailyCompletions: any[], threshold = 80) {
  let currentStreak = 0
  for (let i = dailyCompletions.length - 1; i >= 0; i--) {
    const day = dailyCompletions[i]
    if (day.percent >= threshold) {
      currentStreak++
    } else {
      break
    }
  }
  return currentStreak
}

// Option 3: Minimum habits streak (e.g., at least 2 habits)
function calculateMinimumHabitsStreak(dailyCompletions: any[], totalHabits: number, minHabits = 2) {
  let currentStreak = 0
  for (let i = dailyCompletions.length - 1; i >= 0; i--) {
    const day = dailyCompletions[i]
    const completedHabits = Math.round((day.percent / 100) * totalHabits)
    if (completedHabits >= minHabits) {
      currentStreak++
    } else {
      break
    }
  }
  return currentStreak
}
