"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import type { Garment } from "@/types"

interface GarmentCardProps {
  garment: Garment
  selected?: boolean
  onSelect: (garment: Garment) => void
}

export function GarmentCard({ garment, selected, onSelect }: GarmentCardProps) {
  return (
    <button
      onClick={() => onSelect(garment)}
      className={cn(
        "group relative overflow-hidden border-2 bg-white text-left transition-all hover:shadow-md",
        selected
          ? "border-primary shadow-md ring-2 ring-primary/20"
          : "border-transparent hover:border-primary/30"
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={garment.image_url}
          alt={garment.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {selected && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>

      <div className="p-2.5">
        <p className="line-clamp-1 text-sm font-medium">{garment.name}</p>
        {garment.brand && (
          <p className="text-xs text-muted-foreground">{garment.brand}</p>
        )}
        {garment.price != null && (
          <p className="mt-1 text-sm font-semibold text-primary">
            {formatPrice(garment.price)}
          </p>
        )}
      </div>
    </button>
  )
}
