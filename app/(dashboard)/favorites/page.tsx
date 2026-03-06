import Image from "next/image"
import Link from "next/link"
import { Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-server"
import { formatPrice } from "@/lib/utils"
import type { TryOnResult } from "@/types"

async function getFavorites(): Promise<TryOnResult[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("tryon_results")
    .select("*, garment:garments(*)")
    .eq("user_id", user.id)
    .eq("is_favorite", true)
    .order("created_at", { ascending: false })

  return data ?? []
}

export default async function FavoritesPage() {
  const favorites = await getFavorites()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Favoritos</h1>
          <p className="text-sm text-muted-foreground">
            Seus looks favoritos
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-16 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">
              Nenhum look favoritado ainda
            </p>
            <p className="text-sm text-muted-foreground/70">
              Experimente roupas e favorite seus looks preferidos
            </p>
          </div>
          <Link href="/try-on">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Experimentar agora
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {favorites.map((fav) => (
            <Card key={fav.id} className="overflow-hidden">
              <div className="relative aspect-[3/4] bg-muted">
                <Image
                  src={fav.result_image_url}
                  alt="Look favoritado"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
              <CardContent className="p-3">
                {fav.garment && (
                  <>
                    <p className="line-clamp-1 text-sm font-medium">
                      {fav.garment.name}
                    </p>
                    {fav.garment.price != null && (
                      <p className="text-sm text-primary font-semibold">
                        {formatPrice(fav.garment.price)}
                      </p>
                    )}
                  </>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(fav.created_at).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
