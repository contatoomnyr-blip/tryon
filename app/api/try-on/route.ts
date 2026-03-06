import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase-server"
import { runFashnTryOn } from "@/lib/fashn"

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()

    const body = await req.json()
    const { person_image_url, garment_image_url, garment_id, garment_category } = body

    if (!person_image_url || !garment_image_url) {
      return NextResponse.json(
        { error: "person_image_url e garment_image_url são obrigatórios" },
        { status: 400 }
      )
    }

    if (garment_id) {
      await supabase.from("garments").select("name").eq("id", garment_id).single()
    }

    console.log("FAL_KEY set:", !!process.env['FAL_KEY'])
    console.log("person_image_url:", person_image_url?.substring(0, 60))

    const result_image_url = await runFashnTryOn({
      person_image_url,
      garment_image_url,
      category: garment_category ?? "upper",
    })

    const { data: tryonResult, error: insertError } = await supabase
      .from("tryon_results")
      .insert({
        user_id: null,
        person_image_url,
        garment_id: garment_id ?? null,
        garment_image_url,
        result_image_url,
        is_favorite: false,
        in_cart: false,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({
        result_image_url,
        tryon_result: {
          id: crypto.randomUUID(),
          user_id: null,
          person_image_url,
          garment_id: garment_id ?? null,
          garment_image_url,
          result_image_url,
          is_favorite: false,
          in_cart: false,
          created_at: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({ result_image_url, tryon_result: tryonResult })
  } catch (err) {
    console.error("Erro no try-on:", err)
    const message = err instanceof Error ? err.message : "Erro interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
