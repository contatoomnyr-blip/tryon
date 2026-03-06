"use client"

import { GarmentCard } from "./GarmentCard"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Garment, GarmentCategory } from "@/types"

export const CATALOG_CATEGORIES: { value: GarmentCategory | "all"; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "upper", label: "Camisetas" },
  { value: "lower", label: "Calças" },
  { value: "dress", label: "Vestidos" },
  { value: "overall", label: "Macacões" },
  { value: "look", label: "Look Completo" },
]

interface CatalogFilterProps {
  activeCategory: GarmentCategory | "all"
  onChange: (cat: GarmentCategory | "all") => void
}

export function CatalogFilter({ activeCategory, onChange }: CatalogFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATALOG_CATEGORIES.map(({ value, label }) => (
        <Badge
          key={value}
          variant={activeCategory === value ? "default" : "outline"}
          className={cn(
            "cursor-pointer select-none transition-colors",
            activeCategory === value
              ? "bg-primary hover:bg-primary/90"
              : "hover:bg-secondary"
          )}
          onClick={() => onChange(value)}
        >
          {label}
        </Badge>
      ))}
    </div>
  )
}

interface CatalogGridProps {
  garments: Garment[]
  activeCategory: GarmentCategory | "all"
  selectedGarmentId?: string
  onSelect?: (garment: Garment) => void
}

export function CatalogGrid({
  garments,
  activeCategory,
  selectedGarmentId,
  onSelect,
}: CatalogGridProps) {
  const filtered =
    activeCategory === "all"
      ? garments
      : garments.filter((g) => g.category === activeCategory)

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma peça encontrada nesta categoria.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {filtered.map((garment) => (
        <GarmentCard
          key={garment.id}
          garment={garment}
          selected={garment.id === selectedGarmentId}
          onSelect={onSelect || (() => {})}
        />
      ))}
    </div>
  )
}
