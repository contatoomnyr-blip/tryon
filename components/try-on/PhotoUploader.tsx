"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, User } from "lucide-react"
import { toast } from "sonner"
import { ImagePreview } from "@/components/shared/ImagePreview"
import { cn } from "@/lib/utils"

interface PhotoUploaderProps {
  imageUrl: string | null
  onImageSelected: (file: File) => void
  onImageRemoved: () => void
  fillHeight?: boolean
}

const MAX_SIZE_MB = 5

export function PhotoUploader({
  imageUrl,
  onImageSelected,
  onImageRemoved,
  fillHeight = false,
}: PhotoUploaderProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`Imagem muito grande. Máximo ${MAX_SIZE_MB}MB.`)
        return
      }

      try {
        onImageSelected(file)
      } catch {
        toast.error("Erro ao processar imagem. Tente outro arquivo.")
      }
    },
    [onImageSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    multiple: false,
  })

  if (imageUrl) {
    return (
      <ImagePreview
        src={imageUrl}
        alt="Sua foto"
        onRemove={onImageRemoved}
        aspectRatio={fillHeight ? "auto" : "portrait"}
        className={fillHeight ? "h-full" : undefined}
      />
    )
  }

  return (
    <div className={cn("space-y-2", fillHeight && "flex flex-col h-full")}>
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer flex flex-col items-center justify-center gap-3 border-2 border-dashed transition-colors",
          fillHeight ? "flex-1 min-h-0" : "aspect-[3/4]",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 bg-muted/40 hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          {isDragActive ? (
            <Upload className="h-7 w-7 text-primary" />
          ) : (
            <User className="h-7 w-7 text-primary" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragActive ? "Solte a imagem aqui" : "Arraste sua foto"}
          </p>
          <p className="text-xs text-muted-foreground">
            ou clique para selecionar
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            JPG, PNG, WEBP — até {MAX_SIZE_MB}MB
          </p>
        </div>
      </div>
    </div>
  )
}
