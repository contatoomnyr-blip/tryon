"use client"

import { useState } from "react"
import { Heart, ShoppingCart, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/useFavorites"
import { useCart } from "@/hooks/useCart"
import type { TryOnResult } from "@/types"

interface ActionButtonsProps {
  result: TryOnResult
  onTryAnother: () => void
}

export function ActionButtons({ result, onTryAnother }: ActionButtonsProps) {
  const [isFavorite, setIsFavorite] = useState(result.is_favorite)
  const { toggleFavorite, loading: favLoading } = useFavorites()
  const { addToCart, loading: cartLoading } = useCart()

  async function handleFavorite() {
    const newVal = await toggleFavorite(result.id, isFavorite)
    setIsFavorite(newVal)
  }

  async function handleAddToCart() {
    if (!result.garment_id) return
    await addToCart(result.garment_id, result.id)
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={isFavorite ? "default" : "outline"}
        className="w-full gap-2"
        onClick={handleFavorite}
        disabled={favLoading === result.id}
      >
        {favLoading === result.id ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        )}
        {isFavorite ? "Favoritado" : "Favoritar look"}
      </Button>

      {result.garment_id && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleAddToCart}
          disabled={cartLoading}
        >
          {cartLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          Adicionar ao carrinho
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full gap-2 text-muted-foreground"
        onClick={onTryAnother}
      >
        <RotateCcw className="h-4 w-4" />
        Tentar outra roupa
      </Button>
    </div>
  )
}
