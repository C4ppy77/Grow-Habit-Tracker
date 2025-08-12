"use client"

import { useEffect, useState } from "react"
import { Calendar, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import SeedBagModal from "@/components/rewards/seed-bag-modal"
import GalleryCalendar from "@/components/gallery-calendar"
import HabitCalendar from "@/components/habit-calendar"
import GrowthStagesCard from "@/components/growth-stages-card"
import { getHabits, getHabitCompletions } from "@/lib/database"
import { useAuth } from "@/hooks/use-auth"

const GardenPage = () => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState([])
  const [userFlowerType, setUserFlowerType] = useState("rose")
  const [showSeedBagModal, setShowSeedBagModal] = useState(false)
  const [pendingReward, setPendingReward] = useState(null)
  const [isGalleryMode, setIsGalleryMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const userId = user?.id || "demo-user-123"

      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() // 0-based
      const thisMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`

      console.log(`Garden: Loading data for user: ${userId}`)
      console.log(`Garden: Date range: ${thisMonth}-01 to ${thisMonth}-31`)

      try {
        const [habitsResult, completionsResult] = await Promise.all([
          getHabits(userId),
          getHabitCompletions(userId, `${thisMonth}-01`, `${thisMonth}-31`),
        ])

        console.log("Garden: Habits loaded:", habitsResult.data?.length || 0)
        console.log("Garden: Completions loaded:", completionsResult.data?.length || 0)

        if (habitsResult.data) setHabits(habitsResult.data)
        if (completionsResult.data) setCompletions(completionsResult.data)

        setUserFlowerType("rose")
      } catch (error) {
        console.error("Garden: Error fetching data:", error)
      }

      setLoading(false)
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-slate-300">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGalleryMode(!isGalleryMode)}
            className="flex items-center gap-2"
          >
            {isGalleryMode ? <Calendar className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            {isGalleryMode ? "Calendar" : "Gallery"}
          </Button>
        </div>

        {isGalleryMode ? (
          <GalleryCalendar
            habits={habits}
            completions={completions}
            currentDate={currentDate}
            userFlowerType={userFlowerType}
          />
        ) : (
          <HabitCalendar
            habits={habits}
            completions={completions}
            currentDate={currentDate}
            userFlowerType={userFlowerType}
            onDateChange={setCurrentDate}
          />
        )}

        {showSeedBagModal && pendingReward && (
          <SeedBagModal
            isOpen={showSeedBagModal}
            onClose={() => setShowSeedBagModal(false)}
            reward={pendingReward}
            onUse={() => setPendingReward(null)}
          />
        )}

        <GrowthStagesCard userFlowerType={userFlowerType} />
      </div>
    </div>
  )
}

export default GardenPage
