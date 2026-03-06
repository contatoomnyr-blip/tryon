"use client"

import { useState } from "react"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PhotoUploader } from "./PhotoUploader"
import { ResultViewer } from "./ResultViewer"
import { ActionButtons } from "./ActionButtons"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { CatalogFilter, CatalogGrid } from "@/components/catalog/CatalogGrid"
import { useGarments } from "./GarmentSelector"
import { useTryOn } from "@/hooks/useTryOn"
import { createClient } from "@/lib/supabase"
import { dataURLtoBlob } from "@/lib/utils"
import { toast } from "sonner"
import type { GarmentCategory } from "@/types"

export function TryOnContainer() {
  const [activeCategory, setActiveCategory] = useState<GarmentCategory | "all">("all")
  const { garments, loading: loadingGarments } = useGarments()

  const {
    personImageUrl,
    selectedGarment,
    result,
    status,
    error,
    canTryOn,
    setPersonImage,
    setGarment,
    runTryOn,
    resetResult,
  } = useTryOn()

  async function handlePersonImageSelected(file: File, previewUrl: string) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("Você precisa estar logado."); return }
      const blob = dataURLtoBlob(previewUrl)
      const fileName = `person/${user.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from("try-on-images")
        .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from("try-on-images").getPublicUrl(fileName)
      setPersonImage(file, publicUrl)
    } catch {
      setPersonImage(file, previewUrl)
    }
  }

  const isLoading = status === "uploading" || status === "processing"

  return (
    <div className="space-y-4">

      {/* LINHA 1 — Títulos lado a lado */}
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight">Catálogo</h1>
          <p className="text-sm text-muted-foreground">Clique em uma peça para selecioná-la</p>
        </div>
        <div className="w-72 shrink-0" />
      </div>

      {/* LINHA 2 — Filtro (esquerda) na mesma altura que o label (direita) */}
      <div className="flex gap-6 items-center">
        <div className="min-w-0 flex-1">
          <CatalogFilter activeCategory={activeCategory} onChange={setActiveCategory} />
        </div>
        <div className="w-72 shrink-0" /> {/* espaçador — mesma altura do filtro */}
      </div>

      {/* LINHA 3 — Cards (esquerda) alinhados com foto/resultado (direita) */}
      <div className="flex gap-6 items-start">
        <div className="min-w-0 flex-1">
          {loadingGarments ? (
            <LoadingSpinner message="Carregando catálogo..." size="sm" />
          ) : (
            <CatalogGrid
              garments={garments}
              activeCategory={activeCategory}
              selectedGarmentId={selectedGarment?.id}
              onSelect={setGarment}
            />
          )}
        </div>

        <div className="w-72 shrink-0 space-y-3">
          {/* Foto / resultado */}
          {status === "idle" && (
            <PhotoUploader
              imageUrl={personImageUrl}
              onImageSelected={handlePersonImageSelected}
              onImageRemoved={() => setPersonImage(null as unknown as File, "")}
            />
          )}
          {isLoading && (
            <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-2xl border bg-muted/20">
              <LoadingSpinner animated size="lg" />
              <p className="mt-2 text-center text-xs text-muted-foreground px-4">
                Pipeline de 4 agentes em execução<br />
                Try-on → Upscale → Face restore<br />
                Aguarde ~2 minutos
              </p>
            </div>
          )}
          {status === "error" && (
            <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div className="text-center">
                <p className="text-sm font-medium text-destructive">Erro ao processar</p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={resetResult}>Tentar novamente</Button>
            </div>
          )}
          {status === "done" && result && <ResultViewer result={result} />}

          {/* Botões */}
          {status === "idle" && (
            <Button className="w-full gap-2 py-5 text-sm font-semibold rounded-none" disabled={!canTryOn} onClick={runTryOn}>
              <Sparkles className="h-4 w-4" />
              Experimentar agora
            </Button>
          )}
          {isLoading && (
            <Button className="w-full gap-2 py-5" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </Button>
          )}
          {status === "done" && result && (
            <ActionButtons result={result} onTryAnother={resetResult} />
          )}
        </div>
      </div>
    </div>
  )
}
