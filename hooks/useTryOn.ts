"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { Garment, TryOnResult, TryOnStatus } from "@/types"

export interface TryOnState {
  personImageFile: File | null
  personImageUrl: string | null
  selectedGarment: Garment | null
  garmentImageFile: File | null
  garmentImageUrl: string | null
  result: TryOnResult | null
  status: TryOnStatus
  error: string | null
}

const initialState: TryOnState = {
  personImageFile: null,
  personImageUrl: null,
  selectedGarment: null,
  garmentImageFile: null,
  garmentImageUrl: null,
  result: null,
  status: "idle",
  error: null,
}

export function useTryOn() {
  const [state, setState] = useState<TryOnState>(initialState)

  const setPersonImage = useCallback((file: File, previewUrl: string) => {
    setState((prev) => ({
      ...prev,
      personImageFile: file,
      personImageUrl: previewUrl,
      result: null,
      status: "idle",
      error: null,
    }))
  }, [])

  const setGarment = useCallback((garment: Garment) => {
    setState((prev) => ({
      ...prev,
      selectedGarment: garment,
      garmentImageFile: null,
      garmentImageUrl: garment.image_url,
      result: null,
      status: "idle",
      error: null,
    }))
  }, [])

  const setGarmentImage = useCallback((file: File, previewUrl: string) => {
    setState((prev) => ({
      ...prev,
      selectedGarment: null,
      garmentImageFile: file,
      garmentImageUrl: previewUrl,
      result: null,
      status: "idle",
      error: null,
    }))
  }, [])

  const runTryOn = useCallback(async () => {
    const { personImageUrl, garmentImageUrl, selectedGarment } = state

    if (!personImageUrl || !garmentImageUrl) {
      toast.error("Selecione sua foto e uma roupa antes de continuar.")
      return
    }

    setState((prev) => ({ ...prev, status: "uploading", error: null }))

    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_image_url: personImageUrl,
          garment_image_url: garmentImageUrl,
          garment_id: selectedGarment?.id,
          garment_category: selectedGarment?.category ?? null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erro ao processar imagem")
      }

      setState((prev) => ({ ...prev, status: "processing" }))

      const data = await res.json()

      setState((prev) => ({
        ...prev,
        result: data.tryon_result,
        status: "done",
      }))

      toast.success("Seu look está pronto!")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido"
      setState((prev) => ({ ...prev, status: "error", error: message }))
      toast.error(message)
    }
  }, [state])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const resetResult = useCallback(() => {
    setState((prev) => ({
      ...prev,
      result: null,
      status: "idle",
      error: null,
    }))
  }, [])

  const canTryOn =
    !!state.personImageUrl &&
    !!state.garmentImageUrl &&
    state.status !== "uploading" &&
    state.status !== "processing"

  return {
    ...state,
    canTryOn,
    setPersonImage,
    setGarment,
    setGarmentImage,
    runTryOn,
    reset,
    resetResult,
  }
}
