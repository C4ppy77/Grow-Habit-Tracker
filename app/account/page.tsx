"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getProfile, updateProfile, getHabits, createHabit, updateHabit, deleteHabit } from "@/lib/database"
import { signOut } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, LogOut, User, Settings, Target } from "lucide-react"

interface Profile {
  id: string
  email: string
  display_name: string | null
  lock_past_days: boolean
  pot_ai_enabled?: boolean // Added POT AI setting to profile interface
  theme_preference: string
}

interface Habit {
  id: string
  name: string
  order_index: number
}

export default function AccountPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      // Use demo user ID for testing
      const userId = user?.id || "demo-user-123"

      const [profileResult, habitsResult] = await Promise.all([getProfile(userId), getHabits(userId)])

      if (profileResult.data) {
        const potAiEnabled = localStorage.getItem("pot_ai_enabled") === "true"
        setProfile({ ...profileResult.data, pot_ai_enabled: potAiEnabled })
      }

      if (habitsResult.data) {
        setHabits(habitsResult.data)
      }

      setLoading(false)
    }

    loadData()
  }, [user])

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    const userId = user?.id || "demo-user-123"
    if (!profile) return

    setSaving(true)

    if ("pot_ai_enabled" in updates) {
      localStorage.setItem("pot_ai_enabled", updates.pot_ai_enabled ? "true" : "false")
      setProfile((prev) => (prev ? { ...prev, pot_ai_enabled: updates.pot_ai_enabled } : null))
      setSaving(false)
      return
    }

    const { data } = await updateProfile(userId, updates)
    if (data) {
      setProfile(data)
    }
    setSaving(false)
  }

  const handleAddHabit = async () => {
    const userId = user?.id || "demo-user-123"
    if (!newHabitName.trim()) return

    const { data } = await createHabit(userId, newHabitName.trim(), habits.length)
    if (data) {
      setHabits((prev) => [...prev, data])
      setNewHabitName("")
    }
  }

  const handleUpdateHabit = async (habitId: string, name: string) => {
    const { data } = await updateHabit(habitId, { name })
    if (data) {
      setHabits((prev) => prev.map((h) => (h.id === habitId ? data : h)))
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (habits.length <= 3) {
      alert("You must have at least 3 habits!")
      return
    }

    const { error } = await deleteHabit(habitId)
    if (!error) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-slate-300">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Demo Mode Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-blue-600">🧪</div>
              <div>
                <h3 className="font-medium text-blue-800">Demo Mode Active</h3>
                <p className="text-sm text-blue-700">Testing without authentication - changes are saved locally.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <Input
                value={profile?.display_name || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, display_name: e.target.value } : null))}
                onBlur={(e) => handleUpdateProfile({ display_name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input value={profile?.email || ""} disabled className="bg-gray-50" />
            </div>
          </CardContent>
        </Card>

        {/* Habits Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Manage Your Habits</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Add, edit, or remove habits to track your daily progress.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new habit */}
            <div className="bg-leaf/5 border border-leaf/20 rounded-lg p-4">
              <h4 className="font-medium text-leaf mb-3">Add New Habit</h4>
              <div className="flex space-x-2">
                <Input
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Meditate for 10 minutes"
                  onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
                  className="flex-1"
                />
                <Button onClick={handleAddHabit} disabled={!newHabitName.trim()} className="bg-leaf hover:bg-leaf/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Start with small, achievable habits like "Drink a glass of water" or "Write 3 things I'm
                grateful for"
              </p>
            </div>

            {/* Existing habits */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Your Current Habits ({habits.length})</h4>
              {habits.map((habit, index) => (
                <div
                  key={habit.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-leaf/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-leaf">{index + 1}</span>
                  </div>
                  <Input
                    value={habit.name}
                    onChange={(e) => {
                      setHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, name: e.target.value } : h)))
                    }}
                    onBlur={(e) => handleUpdateHabit(habit.id, e.target.value)}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-leaf"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteHabit(habit.id)}
                    disabled={habits.length <= 3}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title={habits.length <= 3 ? "Minimum 3 habits required" : "Delete habit"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {habits.length <= 3 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Minimum 3 habits required.</strong> Add more habits to enable deletion of existing ones.
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Pro tip:</strong> Your habits appear in today's checklist on the Home page and affect your
                garden growth!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">AI Assistant (POT)</label>
                <p className="text-sm text-gray-500">Enable POT - Personal Objective Tracker AI support</p>
              </div>
              <Switch
                checked={profile?.pot_ai_enabled || false} // Fixed to use pot_ai_enabled instead of lock_past_days
                onCheckedChange={(checked) => handleUpdateProfile({ pot_ai_enabled: checked })} // Updated to save pot_ai_enabled setting
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Theme</label>
                <p className="text-sm text-gray-500">Coming soon: Dark mode support</p>
              </div>
              <Switch checked={false} disabled className="opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Streak History */}
        <Card>
          <CardHeader>
            <CardTitle>All Time Streak History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-leaf/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-leaf">0</div>
                  <div className="text-sm text-gray-500">Best Streak</div>
                  <div className="text-xs text-gray-400 mt-1">Last: Never</div>
                </div>
                <div className="bg-petal/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-petal">0</div>
                  <div className="text-sm text-gray-500">Perfect Days Record</div>
                  <div className="text-xs text-gray-400 mt-1">Last: Never</div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>All-time records:</strong> Your longest consecutive streak and highest perfect days count are
                  saved here with the date you last achieved them.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
