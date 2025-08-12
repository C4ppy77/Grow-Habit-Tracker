import { supabase } from "./supabase"
import type { Database } from "./supabase"
import { storage } from "./safe-storage"

type Habit = Database["public"]["Tables"]["habits"]["Row"] & {
  flower_type?: string
}
type HabitCompletion = Database["public"]["Tables"]["habit_completions"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  preferred_flower_type?: string
  pot_ai_enabled?: boolean
}



// Public API functions
export async function createProfile(userId: string, email: string, displayName?: string) {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email,
      display_name: displayName,
    })
    .select()
    .single()
  return { data, error }
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
  return { data, error }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()
  return { data, error }
}

export async function getHabits(userId: string) {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("order_index")
  return { data, error }
}

export async function createHabit(userId: string, name: string, orderIndex: number) {
  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: userId,
      name,
      order_index: orderIndex,
    })
    .select()
    .single()
  return { data, error }
}

export async function updateHabit(habitId: string, updates: Partial<Habit>) {
  const { data, error } = await supabase.from("habits").update(updates).eq("id", habitId).select().single()
  return { data, error }
}

export async function deleteHabit(habitId: string) {
  const { error } = await supabase.from("habits").delete().eq("id", habitId)
  return { error }
}

export async function getHabitCompletions(userId: string, startDate?: string, endDate?: string) {
  let query = supabase.from("habit_completions").select("*").eq("user_id", userId)
  if (startDate) query = query.gte("completed_date", startDate)
  if (endDate) query = query.lte("completed_date", endDate)
  const { data, error } = await query.order("completed_date", { ascending: false })
  return { data, error }
}

export async function toggleHabitCompletion(userId: string, habitId: string, date: string, notes?: string) {
  const { data: existing } = await supabase
    .from("habit_completions")
    .select("id")
    .eq("user_id", userId)
    .eq("habit_id", habitId)
    .eq("completed_date", date)
    .single()

  if (existing) {
    const { error } = await supabase.from("habit_completions").delete().eq("id", existing.id)
    return { data: null, error }
  } else {
    const { data, error } = await supabase
      .from("habit_completions")
      .insert({ user_id: userId, habit_id: habitId, completed_date: date, notes })
      .select()
      .single()
    return { data, error }
  }
}


