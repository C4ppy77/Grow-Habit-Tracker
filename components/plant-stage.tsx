type FlowerType = "default" | "rose" | "sunflower" | "tulip" | "daisy" | "cherry"

type PlantStageProps = {
  stage?: 0 | 1 | 2 | 3 | 4
  label?: string
  showSpecialFlower?: boolean
  flowerType?: FlowerType // New prop for different flower types
}

export function PlantStage({ stage = 0, label, showSpecialFlower = false, flowerType = "default" }: PlantStageProps) {
  // Pastel palette
  const soil = "#8B5E3C"
  const soilLight = "#A8774E"
  const stem = "#22C55E"
  const leaf = "#16A34A"

  // Different flower color palettes
  const flowerPalettes = {
    default: { petal: "#FDE68A", center: "#F59E0B" },
    rose: { petal: "#FECACA", center: "#DC2626" },
    sunflower: { petal: "#FEF3C7", center: "#D97706" },
    tulip: { petal: "#DDD6FE", center: "#7C3AED" },
    daisy: { petal: "#FFFFFF", center: "#FDE047" },
    cherry: { petal: "#FBCFE8", center: "#EC4899" },
  }

  const { petal, center } = flowerPalettes[flowerType]
  const specialPetal = "#FF69B4"
  const specialCenter = "#FFD700"

  return (
    <div className="flex flex-col items-center relative">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        className="transition-transform duration-300 ease-out hover:scale-105 active:scale-95"
        aria-label={label ? `${label} stage ${stage}` : `Plant stage ${stage}`}
        role="img"
      >
        {/* background sky */}
        <rect x="0" y="0" width="96" height="96" rx="12" fill="#FFE4E6" />
        {/* soil */}
        <rect x="0" y="64" width="96" height="20" fill={soil} />
        <rect x="0" y="60" width="96" height="8" fill={soilLight} opacity="0.6" />

        {/* seed */}
        {stage >= 0 && <ellipse cx="48" cy="62" rx="6" ry="4" fill="#6B7280" />}

        {/* sprout stem */}
        {stage >= 1 && (
          <>
            <rect x="46.5" y="40" width="3" height="22" rx="1.5" fill={stem} />
            {/* one leaf */}
            <path d="M46 50 C38 46, 38 56, 46 54" fill={leaf} opacity="0.9" />
          </>
        )}

        {/* leaves */}
        {stage >= 2 && (
          <>
            <path d="M50 46 C58 42, 58 54, 50 52" fill={leaf} />
            <path d="M44 44 C36 40, 36 52, 44 50" fill={leaf} />
          </>
        )}

        {/* regular flower (bloom stage) */}
        {stage >= 3 && !showSpecialFlower && (
          <>
            {/* Different flower shapes based on type */}
            {flowerType === "sunflower" ? (
              // Sunflower - larger center, more petals
              <>
                <circle cx="48" cy="36" r="7" fill={center} />
                {/* Outer ring of petals */}
                <ellipse cx="48" cy="24" rx="4" ry="8" fill={petal} />
                <ellipse cx="60" cy="30" rx="4" ry="8" fill={petal} transform="rotate(45 60 30)" />
                <ellipse cx="60" cy="42" rx="4" ry="8" fill={petal} transform="rotate(90 60 42)" />
                <ellipse cx="48" cy="48" rx="4" ry="8" fill={petal} transform="rotate(135 48 48)" />
                <ellipse cx="36" cy="42" rx="4" ry="8" fill={petal} transform="rotate(180 36 42)" />
                <ellipse cx="36" cy="30" rx="4" ry="8" fill={petal} transform="rotate(225 36 30)" />
                <ellipse cx="42" cy="24" rx="4" ry="8" fill={petal} transform="rotate(315 42 24)" />
                <ellipse cx="54" cy="24" rx="4" ry="8" fill={petal} transform="rotate(45 54 24)" />
              </>
            ) : flowerType === "tulip" ? (
              // Tulip - cup shape
              <>
                <path d="M48 42 C40 38, 40 28, 48 24 C56 28, 56 38, 48 42" fill={petal} />
                <path d="M42 36 C38 32, 42 26, 48 24" fill={petal} opacity="0.8" />
                <path d="M54 36 C58 32, 54 26, 48 24" fill={petal} opacity="0.8" />
                <circle cx="48" cy="32" r="3" fill={center} />
              </>
            ) : flowerType === "daisy" ? (
              // Daisy - simple petals
              <>
                <circle cx="48" cy="36" r="4" fill={center} />
                {/* Simple petal pattern */}
                <ellipse cx="48" cy="28" rx="3" ry="6" fill={petal} />
                <ellipse cx="56" cy="32" rx="3" ry="6" fill={petal} transform="rotate(45 56 32)" />
                <ellipse cx="56" cy="40" rx="3" ry="6" fill={petal} transform="rotate(90 56 40)" />
                <ellipse cx="48" cy="44" rx="3" ry="6" fill={petal} transform="rotate(135 48 44)" />
                <ellipse cx="40" cy="40" rx="3" ry="6" fill={petal} transform="rotate(180 40 40)" />
                <ellipse cx="40" cy="32" rx="3" ry="6" fill={petal} transform="rotate(225 40 32)" />
              </>
            ) : (
              // Default flower
              <>
                <circle cx="48" cy="36" r="5" fill={center} />
                <circle cx="48" cy="28" r="6" fill={petal} />
                <circle cx="56" cy="32" r="6" fill={petal} />
                <circle cx="40" cy="32" r="6" fill={petal} />
                <circle cx="44" cy="24" r="6" fill={petal} />
                <circle cx="52" cy="24" r="6" fill={petal} />
              </>
            )}
          </>
        )}

        {/* special flower (100% completion in garden only) */}
        {stage >= 4 && showSpecialFlower && (
          <>
            <foreignObject x="34" y="22" width="28" height="28">
              <div className="flex items-center justify-center w-full h-full">
                <span className="text-2xl animate-pulse">🌼</span>
              </div>
            </foreignObject>
          </>
        )}
      </svg>
      {label ? <span className="mt-1 text-xs font-medium text-slate-700">{label}</span> : null}
    </div>
  )
}

// Helper function to convert percentage to stage
export function stageFromPercent(p: number): 0 | 1 | 2 | 3 | 4 {
  if (p >= 100) return 4 // Always show 🌼 for 100%
  if (p >= 80) return 3 // Bloom
  if (p >= 50) return 2 // Leafy
  if (p >= 26) return 1 // Sprout
  return 0 // Seed
}

// Helper function to get flower type based on habit or user preference
export function getFlowerTypeForHabit(habitName: string): FlowerType {
  const name = habitName.toLowerCase()

  if (name.includes("exercise") || name.includes("gym") || name.includes("workout")) return "sunflower"
  if (name.includes("read") || name.includes("book") || name.includes("study")) return "tulip"
  if (name.includes("meditate") || name.includes("mindful") || name.includes("calm")) return "daisy"
  if (name.includes("water") || name.includes("drink") || name.includes("hydrate")) return "cherry"
  if (name.includes("sleep") || name.includes("bed") || name.includes("rest")) return "rose"

  return "default"
}
