"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { Garment } from "@/types"

export function useGarments() {
  const [garments, setGarments] = useState<Garment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => setGarments(data.garments ?? []))
      .catch(() => toast.error("Erro ao carregar catálogo"))
      .finally(() => setLoading(false))
  }, [])

  return { garments, loading }
}
