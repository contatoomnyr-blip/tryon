import { Shirt } from "lucide-react"
import { CatalogGrid } from "@/components/catalog/CatalogGrid"
import { createClient } from "@/lib/supabase-server"
import type { Garment } from "@/types"

async function getGarments(): Promise<Garment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("garments")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

export default async function HomePage() {
  const garments = await getGarments()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shirt className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
          <p className="text-sm text-muted-foreground">
            Escolha uma peça para experimentar virtualmente
          </p>
        </div>
      </div>

      {garments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-16 text-center">
          <Shirt className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">
              Nenhuma peça no catálogo
            </p>
            <p className="text-sm text-muted-foreground/70">
              Adicione roupas via Supabase para começar
            </p>
          </div>
        </div>
      ) : (
        <CatalogGrid garments={garments} activeCategory="all" />
      )}
    </div>
  )
}
