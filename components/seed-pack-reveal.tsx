"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const useSeedPackSounds = () => {
  const openSoundRef = useRef<HTMLAudioElement | null>(null)
  const revealSoundRef = useRef<HTMLAudioElement | null>(null)
  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const rareSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio elements with different pitched tones
    openSoundRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
    )
    revealSoundRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
    )
    successSoundRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
    )
    rareSoundRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
    )

    // Set different frequencies for different sounds
    if (openSoundRef.current) openSoundRef.current.volume = 0.3
    if (revealSoundRef.current) revealSoundRef.current.volume = 0.4
    if (successSoundRef.current) successSoundRef.current.volume = 0.5
    if (rareSoundRef.current) rareSoundRef.current.volume = 0.6
  }, [])

  const playOpenSound = () => {
    if (openSoundRef.current) {
      openSoundRef.current.currentTime = 0
      openSoundRef.current.play().catch(() => {}) // Ignore autoplay restrictions
    }
  }

  const playRevealSound = (rarity: string) => {
    const sound = rarity === "legendary" || rarity === "epic" ? rareSoundRef.current : revealSoundRef.current
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(() => {})
    }
  }

  const playSuccessSound = () => {
    if (successSoundRef.current) {
      successSoundRef.current.currentTime = 0
      successSoundRef.current.play().catch(() => {})
    }
  }

  return { playOpenSound, playRevealSound, playSuccessSound }
}

interface FlowerType {
  name: string
  emoji: string
  rarity: "common" | "rare" | "epic" | "legendary"
  color: string
}

const FLOWER_TYPES: FlowerType[] = [
  { name: "Daisy", emoji: "🌼", rarity: "common", color: "bg-green-100 text-green-800" },
  { name: "Tulip", emoji: "🌷", rarity: "rare", color: "bg-blue-100 text-blue-800" },
  { name: "Sunflower", emoji: "🌻", rarity: "epic", color: "bg-purple-100 text-purple-800" },
  { name: "Marigold", emoji: "🏵️", rarity: "legendary", color: "bg-yellow-100 text-yellow-800" },
]

const RARITY_COLORS = {
  common: "bg-gray-100 text-gray-800 border-gray-300",
  rare: "bg-blue-100 text-blue-800 border-blue-300",
  epic: "bg-purple-100 text-purple-800 border-purple-300",
  legendary: "bg-yellow-100 text-yellow-800 border-yellow-300",
}

interface SeedPackProps {
  index: number
  flower: FlowerType
  isRevealed: boolean
  onReveal: () => void
  revealDelay: number
}

function SeedPack({ index, flower, isRevealed, onReveal, revealDelay }: SeedPackProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const { playOpenSound, playRevealSound } = useSeedPackSounds()

  const handleClick = () => {
    if (isRevealed || isAnimating) return

    playOpenSound()

    setIsAnimating(true)
    setShowParticles(true)

    setTimeout(() => {
      onReveal()
      playRevealSound(flower.rarity)
      setIsAnimating(false)
    }, 600)

    setTimeout(() => {
      setShowParticles(false)
    }, 1200)
  }

  useEffect(() => {
    if (revealDelay > 0) {
      const timer = setTimeout(() => {
        handleClick()
      }, revealDelay)
      return () => clearTimeout(timer)
    }
  }, [revealDelay])

  return (
    <div className="relative">
      {/* Particle effects */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      )}

      <Card
        className={cn(
          "relative h-48 cursor-pointer transition-all duration-300 overflow-hidden",
          "hover:scale-105 hover:shadow-lg",
          isAnimating && "animate-pulse",
          isRevealed ? "bg-gradient-to-br from-green-50 to-emerald-50" : "bg-gradient-to-br from-amber-50 to-orange-50",
        )}
        onClick={handleClick}
      >
        {/* Unopened seed pack */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center transition-all duration-600",
            "bg-gradient-to-br from-amber-100 to-orange-200",
            isRevealed ? "opacity-0 scale-75 rotate-12" : "opacity-100 scale-100 rotate-0",
          )}
        >
          <div className="text-4xl mb-2">📦</div>
          <div className="text-sm font-medium text-amber-800">Seed Pack</div>
          <div className="text-xs text-amber-600 mt-1">Click to open!</div>
        </div>

        {/* Revealed flower */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center transition-all duration-600 delay-300 text-slate-50 bg-slate-50",
            isRevealed ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-125 -rotate-12",
          )}
        >
          <div className="text-6xl mb-3 animate-bounce">{flower.emoji}</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{flower.name}</h3>
          <Badge variant="outline" className={cn("text-xs font-medium", RARITY_COLORS[flower.rarity])}>
            {flower.rarity.toUpperCase()}
          </Badge>
        </div>

        {/* Tear effect overlay */}
        {isAnimating && <div className="absolute inset-0 bg-white opacity-50 animate-pulse" />}
      </Card>
    </div>
  )
}

export default function SeedPackReveal() {
  const [revealedPacks, setRevealedPacks] = useState<boolean[]>([false, false, false, false])
  const [isRevealingAll, setIsRevealingAll] = useState(false)
  const [showAddToCollection, setShowAddToCollection] = useState(false)
  const [revealedFlowers, setRevealedFlowers] = useState<FlowerType[]>([])
  const { toast } = useToast()
  const { playSuccessSound } = useSeedPackSounds()

  const handleRevealPack = (index: number) => {
    setRevealedPacks((prev) => {
      const newRevealed = [...prev]
      newRevealed[index] = true
      return newRevealed
    })

    setRevealedFlowers((prev) => [...prev, FLOWER_TYPES[index]])
    setShowAddToCollection(true)
  }

  const handleRevealAll = () => {
    if (isRevealingAll) return

    setIsRevealingAll(true)

    // Staggered reveal animation
    revealedPacks.forEach((isRevealed, index) => {
      if (!isRevealed) {
        setTimeout(() => {
          handleRevealPack(index)
        }, index * 200)
      }
    })

    setTimeout(() => {
      setIsRevealingAll(false)
    }, 1000)
  }

  const handleReset = () => {
    setRevealedPacks([false, false, false, false])
    setIsRevealingAll(false)
    setShowAddToCollection(false)
    setRevealedFlowers([])
  }

  const handleAddToCollection = () => {
    playSuccessSound()

    toast({
      title: "Added to your collection 🌿",
      description: `${revealedFlowers.length} flower${revealedFlowers.length > 1 ? "s" : ""} added successfully!`,
    })

    setShowAddToCollection(false)
    // Here you would typically save to database/storage
  }

  const handleEarnSeedPack = () => {
    toast({
      title: "You've got a Seed Pack! 🎁 Tap to open.",
      description: "A new seed pack is waiting for you!",
    })
  }

  const allRevealed = revealedPacks.every(Boolean)
  const noneRevealed = revealedPacks.every((pack) => !pack)
  const hasUnrevealedPacks = revealedPacks.some((pack) => !pack)

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-600">Seed Pack Collection</h1>
        <p className="text-gray-500">Click on the seed packs to discover beautiful flowers!</p>
      </div>

      {allRevealed && (
        <Card className="p-6 text-center bg-gray-50 border-dashed border-2 border-gray-300">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-600 font-medium">No unopened packs. Check back on seasonal days!</p>
        </Card>
      )}

      {/* Seed pack grid */}
      {hasUnrevealedPacks && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {FLOWER_TYPES.map((flower, index) => (
            <SeedPack
              key={index}
              index={index}
              flower={flower}
              isRevealed={revealedPacks[index]}
              onReveal={() => handleRevealPack(index)}
              revealDelay={isRevealingAll && !revealedPacks[index] ? index * 200 : 0}
            />
          ))}
        </div>
      )}

      {showAddToCollection && revealedFlowers.length > 0 && (
        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <div className="text-center space-y-3">
            <div className="flex justify-center space-x-2">
              {revealedFlowers.map((flower, index) => (
                <div key={index} className="text-3xl">
                  {flower.emoji}
                </div>
              ))}
            </div>
            <p className="text-emerald-800 font-medium">Add these to your collection?</p>
            <div className="flex space-x-3 justify-center">
              <Button className="text-slate-900" onClick={() => setShowAddToCollection(false)} variant="outline" size="sm">
                Maybe Later
              </Button>
              <Button onClick={handleAddToCollection} className="bg-emerald-600 hover:bg-emerald-700" size="sm">
                Add to Collection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={handleEarnSeedPack}
          variant="outline"
          className="hover:bg-yellow-50 bg-stone-300 border-black"
        >
          🎁 Earn Seed Pack (Demo)
        </Button>
        <Button
          onClick={handleRevealAll}
          disabled={allRevealed || isRevealingAll}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isRevealingAll ? "Revealing..." : "Reveal All"}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={noneRevealed}
          className="border-gray-300 hover:bg-gray-50 bg-transparent"
        >
          Reset Collection
        </Button>
      </div>

      {/* Progress indicator */}
      {hasUnrevealedPacks && (
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">
            Progress: {revealedPacks.filter(Boolean).length} / {FLOWER_TYPES.length} revealed
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(revealedPacks.filter(Boolean).length / FLOWER_TYPES.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {allRevealed && !showAddToCollection && (
        <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="text-2xl mb-2">🎉</div>
          <p className="text-emerald-800 font-medium">
            Congratulations! You've discovered all the flowers in your collection!
          </p>
        </div>
      )}
    </div>
  )
}
