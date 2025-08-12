"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Habit = { id: string; name: string }

export default function TodayQuickList({
  habits,
  todayValues,
  onToggle,
  dateLabel,
}: {
  habits: Habit[]
  todayValues: Record<string, boolean>
  onToggle: (habitId: string, value: boolean) => void
  dateLabel: string
}) {
  if (!habits.length) return null
  return (
    <Card className="sm:hidden border-emerald-200 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Today’s Checklist</CardTitle>
        <p className="text-xs text-slate-600">{dateLabel}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y">
          {habits.map((h) => {
            const checked = !!todayValues[h.id]
            return (
              <li
                key={h.id}
                className="flex items-center justify-between gap-3 py-3 active:opacity-90"
                onClick={(e) => {
                  // Don’t double-toggle if tapping directly on the checkbox element
                  const el = (e.target as HTMLElement).closest('[role="checkbox"]')
                  if (!el) onToggle(h.id, !checked)
                }}
              >
                <span className="text-[15px]">{h.name}</span>
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => onToggle(h.id, !!v)}
                  className="size-6 border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  aria-label={`Mark "${h.name}" complete today`}
                />
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
