"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Upload, Trash2, Plus, Loader2, Check, PackageOpen, Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Garment, GarmentCategory } from "@/types"

const MAX_IMAGES = 6

const CATEGORIES: { value: GarmentCategory; label: string }[] = [
  { value: "upper", label: "Camiseta / Blusa" },
  { value: "lower", label: "Calça / Saia" },
  { value: "dress", label: "Vestido" },
  { value: "overall", label: "Macacão" },
  { value: "look", label: "Look Completo" },
]

interface ImageSlot {
  file: File
  preview: string
}

interface GarmentForm {
  name: string
  brand: string
  price: string
  category: GarmentCategory | ""
  images: ImageSlot[]   // índice 0 = imagem principal (try-on)
}

const emptyForm: GarmentForm = {
  name: "",
  brand: "",
  price: "",
  category: "",
  images: [],
}

export default function AdminCatalogPage() {
  const [form, setForm] = useState<GarmentForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [garments, setGarments] = useState<Garment[]>([])
  const [loadingGarments, setLoadingGarments] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchGarments() {
    setLoadingGarments(true)
    try {
      const res = await fetch("/api/catalog")
      const data = await res.json()
      setGarments(data.garments ?? [])
    } catch {
      toast.error("Erro ao carregar catálogo")
    } finally {
      setLoadingGarments(false)
    }
  }

  useEffect(() => { fetchGarments() }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setForm((f) => {
      const remaining = MAX_IMAGES - f.images.length
      if (remaining <= 0) {
        toast.error(`Máximo de ${MAX_IMAGES} fotos por peça`)
        return f
      }
      const newSlots: ImageSlot[] = acceptedFiles
        .slice(0, remaining)
        .map((file) => ({ file, preview: URL.createObjectURL(file) }))
      return { ...f, images: [...f.images, ...newSlots] }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: true,
    maxFiles: MAX_IMAGES,
  })

  function removeImage(index: number) {
    setForm((f) => {
      const updated = f.images.filter((_, i) => i !== index)
      return { ...f, images: updated }
    })
  }

  function setMainImage(index: number) {
    setForm((f) => {
      const updated = [...f.images]
      const [picked] = updated.splice(index, 1)
      return { ...f, images: [picked, ...updated] }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.images.length === 0 || !form.name || !form.category) {
      toast.error("Preencha nome, categoria e pelo menos 1 imagem")
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("brand", form.brand)
      formData.append("price", form.price)
      formData.append("category", form.category)
      // primeira imagem = principal (try-on), demais = galeria
      form.images.forEach((slot, i) => {
        formData.append(i === 0 ? "image" : "gallery[]", slot.file)
      })

      const res = await fetch("/api/admin/garment", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success(`"${form.name}" adicionado com ${form.images.length} foto(s)!`)
      setForm(emptyForm)
      fetchGarments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover "${name}" do catálogo?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/garment?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Peça removida")
      setGarments((prev) => prev.filter((g) => g.id !== id))
    } catch {
      toast.error("Erro ao remover peça")
    } finally {
      setDeletingId(null)
    }
  }

  const canAddMore = form.images.length < MAX_IMAGES

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Catálogo</h1>
        <p className="text-sm text-muted-foreground">Adicione e remova peças do catálogo de try-on</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        {/* ── FORMULÁRIO ── */}
        <div className="space-y-5 border p-6">
          <h2 className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar peça
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Grade de imagens */}
            <div className="space-y-2">
              <Label>
                Fotos da peça{" "}
                <span className="text-muted-foreground font-normal">
                  ({form.images.length}/{MAX_IMAGES}) — 1ª foto usada no try-on
                </span>
              </Label>

              <div className="grid grid-cols-3 gap-2">
                {/* Slots preenchidos */}
                {form.images.map((slot, i) => (
                  <div key={i} className="relative aspect-square border overflow-hidden bg-gray-50 group">
                    <Image
                      src={slot.preview}
                      alt={`Foto ${i + 1}`}
                      fill
                      className="object-contain"
                    />

                    {/* Badge principal */}
                    {i === 0 && (
                      <div className="absolute left-1 top-1 flex items-center gap-0.5 bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        <Star className="h-2.5 w-2.5" />
                        Principal
                      </div>
                    )}

                    {/* Ações ao hover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      {i !== 0 && (
                        <button
                          type="button"
                          onClick={() => setMainImage(i)}
                          className="flex items-center gap-1 bg-white px-2 py-1 text-[10px] font-medium text-gray-800 hover:bg-gray-100"
                        >
                          <Star className="h-2.5 w-2.5" />
                          Principal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="flex items-center gap-1 bg-red-500 px-2 py-1 text-[10px] font-medium text-white hover:bg-red-600"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                        Remover
                      </button>
                    </div>
                  </div>
                ))}

                {/* Slot de adicionar (enquanto não atingiu o limite) */}
                {canAddMore && (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "aspect-square flex cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed transition-colors",
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <p className="text-[10px] text-center text-muted-foreground px-1">
                      {isDragActive ? "Solte" : form.images.length === 0 ? "Adicionar fotos" : "Mais fotos"}
                    </p>
                  </div>
                )}

                {/* Slots vazios para completar o grid visual */}
                {Array.from({
                  length: Math.max(0, 3 - ((form.images.length % 3) || 3) - (canAddMore ? 1 : 0)),
                }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square border border-dashed border-muted-foreground/10 bg-muted/10" />
                ))}
              </div>

              {form.images.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Passe o mouse sobre uma foto para defini-la como principal ou removê-la
                </p>
              )}
            </div>

            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome da peça *</Label>
              <Input
                id="name"
                placeholder="Ex: Vestido Midi Floral"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            {/* Marca */}
            <div className="space-y-1.5">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                placeholder="Ex: C&A"
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              />
            </div>

            {/* Preço */}
            <div className="space-y-1.5">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 89.90"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ value, label }) => (
                  <Badge
                    key={value}
                    variant={form.category === value ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer select-none transition-colors",
                      form.category === value ? "bg-primary" : "hover:bg-secondary"
                    )}
                    onClick={() => setForm((f) => ({ ...f, category: value }))}
                  >
                    {form.category === value && <Check className="mr-1 h-3 w-3" />}
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-none gap-2"
              disabled={submitting || form.images.length === 0}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? "Salvando..." : "Adicionar ao catálogo"}
            </Button>
          </form>
        </div>

        {/* ── LISTA DO CATÁLOGO ── */}
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <PackageOpen className="h-4 w-4" />
            Catálogo atual
            <span className="text-sm font-normal text-muted-foreground">({garments.length} peças)</span>
          </h2>

          {loadingGarments ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
            </div>
          ) : garments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma peça no catálogo.</p>
          ) : (
            <div className="max-h-[680px] space-y-2 overflow-y-auto pr-1">
              {garments.map((g) => (
                <div key={g.id} className="flex items-center gap-3 border bg-white p-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden border bg-gray-50">
                    <Image src={g.image_url} alt={g.name} fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{g.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      {g.brand && <span className="text-xs text-muted-foreground">{g.brand}</span>}
                      <Badge variant="outline" className="h-4 py-0 text-xs">
                        {CATEGORIES.find((c) => c.value === g.category)?.label ?? g.category}
                      </Badge>
                      {g.price != null && (
                        <span className="text-xs font-medium text-primary">
                          R$ {g.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 rounded-none text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(g.id, g.name)}
                    disabled={deletingId === g.id}
                  >
                    {deletingId === g.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
