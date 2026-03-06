"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

export function useCart() {
  const [loading, setLoading] = useState(false)

  const addToCart = useCallback(
    async (garmentId: string, tryonResultId?: string) => {
      setLoading(true)
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            garment_id: garmentId,
            tryon_result_id: tryonResultId,
          }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Erro ao adicionar ao carrinho")
        }

        toast.success("Adicionado ao carrinho!")
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const removeFromCart = useCallback(async (cartItemId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Erro ao remover item")

      toast.success("Item removido do carrinho")
    } catch {
      toast.error("Não foi possível remover o item")
    } finally {
      setLoading(false)
    }
  }, [])

  return { addToCart, removeFromCart, loading }
}
