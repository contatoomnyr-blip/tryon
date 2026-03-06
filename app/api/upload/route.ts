import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  try {
    const { image_base64, mime_type } = await req.json()

    if (!image_base64) {
      return NextResponse.json({ error: "image_base64 obrigatório" }, { status: 400 })
    }

    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")
    const ext = (mime_type ?? "image/jpeg").split("/")[1] ?? "jpg"
    const fileName = `person/guest/${Date.now()}.${ext}`

    const supabase = createServiceClient()
    const { error: uploadError } = await supabase.storage
      .from("try-on-images")
      .upload(fileName, buffer, { upsert: true, contentType: mime_type ?? "image/jpeg" })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from("try-on-images")
      .getPublicUrl(fileName)

    return NextResponse.json({ public_url: publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro no upload"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
