import { NextRequest, NextResponse } from "next/server"
import { fal } from "@fal-ai/client"
import { createClient } from "@/lib/supabase-server"

fal.config({ credentials: process.env.FAL_KEY })

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { image_url } = await req.json()
    if (!image_url) {
      return NextResponse.json({ error: "image_url obrigatório" }, { status: 400 })
    }

    const result = await fal.subscribe("fal-ai/kling-video/v1.6/standard/image-to-video", {
      input: {
        image_url,
        prompt:
          "fashion model walking confidently, full body shot, smooth natural movement, " +
          "cinematic fashion editorial, elegant pose transition, professional catwalk style",
        negative_prompt: "blurry, distorted, low quality, static, no movement",
        duration: "5",
      },
    })

    const output = result.data as { video?: { url: string }; url?: string }
    const video_url = output.video?.url ?? output.url

    if (!video_url) throw new Error("Vídeo não gerado")

    return NextResponse.json({ video_url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
