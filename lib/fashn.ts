import { fal } from "@fal-ai/client"

fal.config({ credentials: process.env.FAL_KEY })

export interface FashnTryOnInput {
  person_image_url: string
  garment_image_url: string
  category: "tops" | "bottoms" | "one-pieces"
}

// Agente especializado: aplica UMA peça de roupa na pessoa
async function fashnAgent(input: FashnTryOnInput): Promise<string> {
  const result = await fal.subscribe("fal-ai/fashn/tryon/v1.5", {
    input: {
      model_image: input.person_image_url,
      garment_image: input.garment_image_url,
      category: input.category,
      garment_photo_type: "model",
      mode: "quality",
      segmentation_free: true,
      output_format: "jpeg",
      num_samples: 1,
    },
  })

  const output = result.data as { images?: { url: string }[]; image?: { url: string } }
  const url = output.images?.[0]?.url ?? output.image?.url
  if (!url) throw new Error("FASHN não retornou imagem")
  return url
}

// Agente upscale: aumenta resolução 4x com Real-ESRGAN
async function upscaleAgent(imageUrl: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/esrgan", {
    input: {
      image_url: imageUrl,
      scale: 2,
      model: "RealESRGAN_x4plus",
      face: false,
      output_format: "jpeg",
    },
  })

  const output = result.data as { image?: { url: string } }
  const url = output.image?.url
  if (!url) throw new Error("ESRGAN não retornou imagem")
  return url
}

// Agente rosto: restaura e preserva detalhes faciais com CodeFormer
async function faceRestoreAgent(imageUrl: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/codeformer", {
    input: {
      image_url: imageUrl,
      fidelity: 0.9,   // 0=máxima restauração, 1=máxima fidelidade ao original
    },
  })

  const output = result.data as { image?: { url: string }; output?: string }
  const url = output.image?.url ?? output.output
  if (!url) throw new Error("CodeFormer não retornou imagem")
  return url
}


// ── Pipeline completo multi-agente ──
export async function runMultiAgentTryOn(
  personImageUrl: string,
  upperGarmentUrl: string | null,
  lowerGarmentUrl: string | null
): Promise<string> {
  let current = personImageUrl

  // Agente 2 — Upper garment (tops)
  if (upperGarmentUrl) {
    current = await fashnAgent({
      person_image_url: current,
      garment_image_url: upperGarmentUrl,
      category: "tops",
    })
  }

  // Agente 3 — Lower garment (bottoms) usando resultado do upper como base
  if (lowerGarmentUrl) {
    current = await fashnAgent({
      person_image_url: current,
      garment_image_url: lowerGarmentUrl,
      category: "bottoms",
    })
  }

  // Agente 5a — Upscale 4x
  current = await upscaleAgent(current)

  // Agente 5b — Restauração do rosto
  current = await faceRestoreAgent(current)

  return current
}

// Pipeline simples (look completo em 1 passada) com upscale + face restore
export async function runFashnTryOn(input: {
  person_image_url: string
  garment_image_url: string
  category?: string
}): Promise<string> {
  const cat = input.category ?? "upper"

  const categoryMap: Record<string, "tops" | "bottoms" | "one-pieces"> = {
    upper: "tops",
    lower: "bottoms",
    dress: "one-pieces",
    overall: "one-pieces",
  }

  let tryOnUrl: string

  if (cat === "look") {
    const upperUrl = await fashnAgent({
      person_image_url: input.person_image_url,
      garment_image_url: input.garment_image_url,
      category: "tops",
    })
    tryOnUrl = await fashnAgent({
      person_image_url: upperUrl,
      garment_image_url: input.garment_image_url,
      category: "bottoms",
    })
  } else {
    tryOnUrl = await fashnAgent({
      person_image_url: input.person_image_url,
      garment_image_url: input.garment_image_url,
      category: categoryMap[cat] ?? "tops",
    })
  }

  // Upscale + face restore em paralelo não é possível (dependem um do outro)
  // Upscale primeiro, depois face restore
  const upscaled = await upscaleAgent(tryOnUrl)
  const restored = await faceRestoreAgent(upscaled)

  return restored
}
