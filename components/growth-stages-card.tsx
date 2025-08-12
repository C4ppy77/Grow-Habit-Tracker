"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlantStage } from "@/components/plant-stage"

interface GrowthStagesCardProps {
  userFlowerType: string
}

export default function GrowthStagesCard({ userFlowerType }: GrowthStagesCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Growth Stages</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="scale-50 sm:scale-75 lg:scale-100">
              <PlantStage stage={0} flowerType={userFlowerType as any} />
            </div>
            <span className="text-xs sm:text-sm text-gray-600 font-medium">Seed (0-25%)</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="scale-50 sm:scale-75 lg:scale-100">
              <PlantStage stage={1} flowerType={userFlowerType as any} />
            </div>
            <span className="text-xs sm:text-sm text-gray-600 font-medium">Sprout (26-49%)</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="scale-50 sm:scale-75 lg:scale-100">
              <PlantStage stage={2} flowerType={userFlowerType as any} />
            </div>
            <span className="text-xs sm:text-sm text-gray-600 font-medium">Leafy (50-79%)</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="scale-50 sm:scale-75 lg:scale-100">
              <PlantStage stage={3} flowerType={userFlowerType as any} />
            </div>
            <span className="text-xs sm:text-sm text-gray-600 font-medium">Bloom (80-99%)</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="scale-50 sm:scale-75 lg:scale-100">
              <PlantStage stage={4} flowerType={userFlowerType as any} showSpecialFlower={true} />
            </div>
            <span className="text-xs sm:text-sm text-gray-600 font-medium">Perfect (100%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
