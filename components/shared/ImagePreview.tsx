"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImagePreviewProps {
  src: string
  alt: string
  onRemove?: () => void
  className?: string
  aspectRatio?: "square" | "portrait" | "auto"
}

export function ImagePreview({
  src,
  alt,
  onRemove,
  className,
  aspectRatio = "square",
}: ImagePreviewProps) {
  const aspectClass = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    auto: "",
  }[aspectRatio]

  return (
    <div className={cn("relative overflow-hidden rounded-xl border bg-muted", aspectClass, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      {onRemove && (
        <Button
          size="icon"
          variant="destructive"
          className="absolute right-2 top-2 h-7 w-7 rounded-full opacity-90"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
