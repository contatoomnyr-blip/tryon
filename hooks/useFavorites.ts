"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

export function useFavorites() {
  const [loading, setLoading] = useState<string | null>(null)

  const toggleFavorite = useCallback(
    async (tryonResultId: string, currentValue: boolean) => {
      setLoading(tryonResultId)
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tryon_result_id: tryonResultId,
            is_favorite: !currentValue,
          }),
        })

        if (!res.ok) throw new Error("Erro ao atualizar favorito")

        toast.success(
          !currentValue ? "Adicionado aos favoritos!" : "Removido dos favoritos"
        )
        return !currentValue
      } catch {
        toast.error("Não foi possível atualizar favorito")
        return currentValue
      } finally {
        setLoading(null)
      }
    },
    []
  )

  return { toggleFavorite, loading }
}
