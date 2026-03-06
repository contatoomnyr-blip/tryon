import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// Mapeia categoria do banco para o formato do IDM-VTON
const CATEGORY_MAP: Record<string, string> = {
  upper: "upper_body",
  lower: "lower_body",
  dress: "dresses",
  overall: "dresses",
  look: "dresses",
}

function extractUrl(output: unknown): string {
  if (typeof output === "string") return output
  if (Array.isArray(output) && output.length > 0) {
    const first = output[0]
    if (typeof first === "string") return first
    if (first && typeof (first as { url?: () => string }).url === "function") {
      return (first as { url: () => string }).url()
    }
    return String(first)
  }
  if (output && typeof (output as { url?: () => string }).url === "function") {
    return (output as { url: () => string }).url()
  }
  if (output && typeof output === "object") {
    const obj = output as Record<string, unknown>
    const urlVal = obj.output ?? obj.url ?? obj.image ?? obj.result
    if (typeof urlVal === "string") return urlVal
  }
  throw new Error("Resposta inesperada da API Replicate")
}

export interface TryOnInput {
  human_img_url: string
  garm_img_url: string
  garment_des?: string
  category?: string
  denoise_steps?: number
  seed?: number
}

export async function runOOTDiffusion(input: {
  person_image_url: string
  garment_image_url: string
}): Promise<string> {
  const output = await replicate.run(
    "viktorfa/oot_diffusion:9f8fa4956970dde99689af7488157a30aa152e23953526a605df1d77598343d7",
    {
      input: {
        model_image: input.person_image_url,
        garment_image: input.garment_image_url,
        steps: 20,
        guidance_scale: 2,
      },
    }
  )

  return extractUrl(output)
}

export async function runVirtualTryOn(input: TryOnInput): Promise<string> {
  const category = CATEGORY_MAP[input.category ?? "upper"] ?? "upper_body"

  const output = await replicate.run(
    "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
    {
      input: {
        crop: true,
        seed: input.seed ?? 42,
        steps: 40,
        category,
        force_dc: true,
        human_img: input.human_img_url,
        garm_img: input.garm_img_url,
        garment_des: input.garment_des ?? "a clothing item",
        mask_only: false,
      },
    }
  )

  return extractUrl(output)
}
