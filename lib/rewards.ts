import { storage } from "./safe-storage"

export interface SeedBag {
  id: string
  flowerType: string
  monthEarned: string
  yearEarned: number
  dateEarned: string
  used: boolean
}

export interface MonthlyReward {
  month: string
  year: number
  perfectDays: number
  totalDays: number
  isPerfectMonth: boolean
  rewardEarned?: SeedBag
}

const SEED_BAGS_KEY = "grow:seed-bags"
const MONTHLY_REWARDS_KEY = "grow:monthly-rewards"

// Flower types that can be earned as rewards
const REWARD_FLOWERS = ["rose", "sunflower", "tulip", "cherry", "daisy", "lotus"]

export function getSeedBags(): SeedBag[] {
  try {
    const raw = storage.getItem(SEED_BAGS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSeedBags(seedBags: SeedBag[]) {
  try {
    storage.setItem(SEED_BAGS_KEY, JSON.stringify(seedBags))
  } catch {
    // Handle storage errors silently
  }
}

export function getMonthlyRewards(): MonthlyReward[] {
  try {
    const raw = storage.getItem(MONTHLY_REWARDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveMonthlyRewards(rewards: MonthlyReward[]) {
  try {
    storage.setItem(MONTHLY_REWARDS_KEY, JSON.stringify(rewards))
  } catch {
    // Handle storage errors silently
  }
}

export function checkForPerfectMonth(
  monthKey: string,
  habits: any[],
  completions: any[],
): { isPerfect: boolean; reward?: SeedBag } {
  const [year, month] = monthKey.split("-").map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()

  // Count perfect days (100% completion)
  let perfectDays = 0

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const dayCompletions = completions.filter((c: any) => c.completed_date === dateStr).length

    if (habits.length > 0 && dayCompletions === habits.length) {
      perfectDays++
    }
  }

  const isPerfectMonth = perfectDays === daysInMonth && habits.length > 0

  if (isPerfectMonth) {
    // Check if reward already earned for this month
    const existingRewards = getMonthlyRewards()
    const alreadyRewarded = existingRewards.some((r) => r.month === monthKey && r.isPerfectMonth)

    if (!alreadyRewarded) {
      // Generate new seed bag reward
      const flowerType = REWARD_FLOWERS[Math.floor(Math.random() * REWARD_FLOWERS.length)]
      const monthName = new Date(year, month - 1).toLocaleDateString("en-US", { month: "long" })

      const reward: SeedBag = {
        id: `seed-${monthKey}-${Date.now()}`,
        flowerType,
        monthEarned: monthName,
        yearEarned: year,
        dateEarned: new Date().toISOString(),
        used: false,
      }

      // Save the seed bag
      const seedBags = getSeedBags()
      seedBags.push(reward)
      saveSeedBags(seedBags)

      // Save the monthly reward record
      const monthlyReward: MonthlyReward = {
        month: monthKey,
        year,
        perfectDays,
        totalDays: daysInMonth,
        isPerfectMonth: true,
        rewardEarned: reward,
      }

      existingRewards.push(monthlyReward)
      saveMonthlyRewards(existingRewards)

      return { isPerfect: true, reward }
    }
  }

  return { isPerfect: isPerfectMonth }
}

export function useSeedBag(seedBagId: string): boolean {
  try {
    const seedBags = getSeedBags()
    const seedBag = seedBags.find((sb) => sb.id === seedBagId)

    if (seedBag && !seedBag.used) {
      seedBag.used = true
      saveSeedBags(seedBags)
      return true
    }

    return false
  } catch {
    return false
  }
}

export function getUnusedSeedBags(): SeedBag[] {
  return getSeedBags().filter((sb) => !sb.used)
}

export function getUserFlowerType(userId: string): string {
  // Get user's selected flower type from seed bags
  const seedBags = getSeedBags()
  const usedSeedBag = seedBags.find((sb) => sb.used)

  return usedSeedBag?.flowerType || "default"
}
