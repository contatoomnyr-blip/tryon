"use client"

import { useState } from "react"
import Image from "next/image"
import { Download, Clapperboard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { TryOnResult } from "@/types"

interface ResultViewerProps {
  result: TryOnResult
}

export function ResultViewer({ result }: ResultViewerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [generatingVideo, setGeneratingVideo] = useState(false)

  async function handleDownload() {
    try {
      const res = await fetch(result.result_image_url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `try-it-on-${result.id}.jpg`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(result.result_image_url, "_blank")
    }
  }

  async function handleGenerateVideo() {
    setGeneratingVideo(true)
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: result.result_image_url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setVideoUrl(data.video_url)
      toast.success("Vídeo gerado!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar vídeo")
    } finally {
      setGeneratingVideo(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Imagem ou vídeo */}
      {videoUrl ? (
        <div className="relative aspect-[9/16] overflow-hidden border bg-black">
          <video
            src={videoUrl}
            autoPlay
            loop
            playsInline
            controls
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="relative aspect-[3/4] overflow-hidden border">
          <Image
            src={result.result_image_url}
            alt="Resultado do try-on"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      )}

      {/* Botão gerar vídeo */}
      {!videoUrl && (
        <Button
          variant="outline"
          className="w-full gap-2 rounded-none border-primary/40 text-primary hover:bg-primary/5"
          onClick={handleGenerateVideo}
          disabled={generatingVideo}
        >
          {generatingVideo ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando vídeo... (~30s)
            </>
          ) : (
            <>
              <Clapperboard className="h-4 w-4" />
              Ver em movimento
            </>
          )}
        </Button>
      )}

      {/* Botões de download */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2 rounded-none"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Foto
        </Button>
        {videoUrl && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 rounded-none"
            onClick={() => window.open(videoUrl, "_blank")}
          >
            <Download className="h-4 w-4" />
            Vídeo
          </Button>
        )}
      </div>
    </div>
  )
}
