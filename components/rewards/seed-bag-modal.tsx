"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlantStage } from "../plant-stage"
import { Sparkles, Gift, Calendar } from "lucide-react"

interface SeedBagModalProps {
  isOpen: boolean
  onClose: () => void
  flowerType: string
  monthName: string
  onSelectFlower: (flowerType: string) => void
}

const FLOWER_REWARDS = {
  rose: {
    name: "Rose Seeds",
    description: "Elegant red roses that bloom with romantic beauty",
    rarity: "Rare",
    color: "text-red-500",
  },
  sunflower: {
    name: "Sunflower Seeds",
    description: "Bright golden sunflowers that radiate positivity",
    rarity: "Epic",
    color: "text-yellow-500",
  },
  tulip: {
    name: "Tulip Bulbs",
    description: "Graceful purple tulips that represent perfect growth",
    rarity: "Rare",
    color: "text-purple-500",
  },
  cherry: {
    name: "Cherry Blossom Seeds",
    description: "Delicate pink blossoms that celebrate achievement",
    rarity: "Legendary",
    color: "text-pink-500",
  },
  daisy: {
    name: "Daisy Seeds",
    description: "Pure white daisies that symbolize new beginnings",
    rarity: "Common",
    color: "text-white",
  },
  lotus: {
    name: "Lotus Seeds",
    description: "Sacred lotus flowers that represent enlightenment",
    rarity: "Mythic",
    color: "text-indigo-500",
  },
}

const SeedBagModal = ({ isOpen, onClose, flowerType, monthName, onSelectFlower }: SeedBagModalProps) => {
  const [showReward, setShowReward] = useState(true)
  const flower = FLOWER_REWARDS[flowerType as keyof typeof FLOWER_REWARDS] || FLOWER_REWARDS.rose

  const handleUseSeeds = () => {
    onSelectFlower(flowerType)
    setShowReward(false)
    setTimeout(() => {
      onClose()
      setShowReward(true)
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        {showReward ? (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-3 sm:mb-4 relative">
                <div className="text-4xl sm:text-6xl animate-bounce">🎁</div>
                <Sparkles className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 h-4 w-4 sm:h-6 sm:w-6 text-yellow-400 animate-pulse" />
                <Sparkles className="absolute -bottom-1 -left-1 sm:-left-2 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 animate-pulse delay-300" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl text-leaf">Perfect Month Reward!</DialogTitle>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                Congratulations! You completed a perfect month in <strong>{monthName}</strong>
              </p>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6">
              {/* Seed Bag */}
              <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🌱</div>
                  <h3 className={`text-lg sm:text-xl font-bold ${flower.color} mb-2`}>{flower.name}</h3>
                  <div
                    className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium mb-2 sm:mb-3 ${
                      flower.rarity === "Mythic"
                        ? "bg-indigo-100 text-indigo-800"
                        : flower.rarity === "Legendary"
                          ? "bg-pink-100 text-pink-800"
                          : flower.rarity === "Epic"
                            ? "bg-yellow-100 text-yellow-800"
                            : flower.rarity === "Rare"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {flower.rarity}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">{flower.description}</p>

                  {/* Preview of the flower */}
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <PlantStage stage={3} flowerType={flowerType as any} />
                  </div>
                </CardContent>
              </Card>

              {/* Achievement Details */}
              <div className="bg-leaf/5 border border-leaf/20 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-leaf flex-shrink-0" />
                  <span className="font-medium text-leaf text-sm sm:text-base">Perfect Month Achievement</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  You completed 100% of your habits every single day in {monthName}. This rare achievement unlocks
                  special flower seeds for your garden!
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full sm:flex-1 bg-transparent text-sm sm:text-base"
                >
                  Save for Later
                </Button>
                <Button
                  onClick={handleUseSeeds}
                  className="w-full sm:flex-1 bg-leaf hover:bg-leaf/90 text-sm sm:text-base"
                >
                  <Gift className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Use Seeds Now
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🌸</div>
            <h3 className="text-lg sm:text-xl font-bold text-leaf mb-2">Seeds Planted!</h3>
            <p className="text-sm sm:text-base text-gray-600 px-2">
              Your new {flower.name.toLowerCase()} will now bloom in your garden calendar!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SeedBagModal
export { SeedBagModal }
