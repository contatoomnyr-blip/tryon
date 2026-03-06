import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

export async function compressImage(file: File, maxSizePx = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)

      // Redimensiona mantendo proporção original
      let { width, height } = img
      if (width > height && width > maxSizePx) {
        height = Math.round((height * maxSizePx) / width)
        width = maxSizePx
      } else if (height > maxSizePx) {
        width = Math.round((width * maxSizePx) / height)
        height = maxSizePx
      }

      // Padda para proporção 3:4 (esperada pelo IDM-VTON)
      // Garante que a pessoa não seja achacada pelo modelo
      const TARGET_RATIO = 3 / 4
      const imgRatio = width / height
      let canvasW = width
      let canvasH = height
      let offsetX = 0
      let offsetY = 0

      if (imgRatio > TARGET_RATIO) {
        // Imagem mais larga que 3:4 → adiciona padding vertical
        canvasH = Math.round(width / TARGET_RATIO)
        offsetY = Math.round((canvasH - height) / 2)
      } else if (imgRatio < TARGET_RATIO) {
        // Imagem mais estreita que 3:4 → adiciona padding horizontal
        canvasW = Math.round(height * TARGET_RATIO)
        offsetX = Math.round((canvasW - width) / 2)
      }

      const canvas = document.createElement("canvas")
      canvas.width = canvasW
      canvas.height = canvasH
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvasW, canvasH)
      ctx.drawImage(img, offsetX, offsetY, width, height)

      resolve(canvas.toDataURL("image/jpeg", 0.85))
    }
    img.onerror = reject
    img.src = url
  })
}

export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(",")
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
