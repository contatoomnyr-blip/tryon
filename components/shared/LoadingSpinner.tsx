"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const processingMessages = [
  "Analisando sua foto...",
  "Detectando silhueta...",
  "Ajustando a roupa...",
  "Aplicando texturas...",
  "Finalizando o look...",
  "Quase pronto...",
]

interface LoadingSpinnerProps {
  message?: string
  animated?: boolean
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({
  message,
  animated = false,
  size = "md",
}: LoadingSpinnerProps) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (!animated) return
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % processingMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [animated])

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-primary`}
      />
      {(message || animated) && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {animated ? processingMessages[msgIndex] : message}
        </p>
      )}
    </div>
  )
}
