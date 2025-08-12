"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlantStage } from "./plant-stage"

const FLOWER_TYPES = [
  { type: "default", name: "Classic", description: "Traditional yellow flower" },
  { type: "rose", name: "Rose", description: "Romantic red petals" },
  { type: "sunflower", name: "Sunflower", description: "Bright and cheerful" },
  { type: "tulip", name: "Tulip", description: "Elegant purple cup" },
  { type: "daisy", name: "Daisy", description: "Simple white petals" },
  { type: "cherry", name: "Cherry Blossom", description: "Delicate pink blooms" },
] as const

interface FlowerCustomizationProps {
  onSelectFlower: (flowerType: string) => void
  currentFlower?: string
}

export default function FlowerCustomization({ onSelectFlower, currentFlower = "default" }: FlowerCustomizationProps) {
  const [selectedType, setSelectedType] = useState(currentFlower)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🌸 Choose Your Flower Style</CardTitle>
        <p className="text-sm text-gray-600">Select how your flowers will look when habits bloom in your garden</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {FLOWER_TYPES.map(({ type, name, description }) => (
            <div
              key={type}
              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedType === type
                  ? "border-leaf bg-leaf/5 ring-2 ring-leaf/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedType(type)}
            >
              <div className="flex flex-col items-center space-y-2">
                <PlantStage stage={3} flowerType={type as any} />
                <div className="text-center">
                  <div className="font-medium text-sm">{name}</div>
                  <div className="text-xs text-gray-500">{description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">Preview: Your flowers will look like this when habits reach 80%+</div>
          <Button
            onClick={() => onSelectFlower(selectedType)}
            className="bg-leaf hover:bg-leaf/90"
            disabled={selectedType === currentFlower}
          >
            {selectedType === currentFlower ? "Current Style" : "Apply Style"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
