"use client"

import { PlantStage, stageFromPercent } from "../plant-stage"

interface WeeklyFlowersProps {
  weeklyProgress: number[] // Array of 4 weekly percentages
  className?: string
  flowerTypes?: string[] // Optional: specify flower types for each week
}

export default function WeeklyFlowers({ weeklyProgress, className = "", flowerTypes }: WeeklyFlowersProps) {
  return (
    <div className={`flex justify-between items-center space-x-2 ${className}`}>
      {weeklyProgress.map((progress, index) => {
        const stage = stageFromPercent(progress)
        const flowerType = (flowerTypes?.[index] as any) || "default"

        return (
          <div key={index} className="flex flex-col items-center space-y-2">
            <PlantStage stage={stage} flowerType={flowerType} />
            <div className="text-center">
              <div className="text-xs font-medium text-gray-700">Week {index + 1}</div>
              <div className="text-xs text-gray-500">{progress}%</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
