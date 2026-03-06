import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase-server"

type ServiceClient = ReturnType<typeof createServiceClient>

async function uploadFile(
  supabase: ServiceClient,
  file: File,
  prefix: string
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg"
  const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = new Uint8Array(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from("try-on-images")
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from("try-on-images")
    .getPublicUrl(fileName)

  return publicUrl
}

export async function POST(req: NextRequest) {
  try {
    // Auth check com client normal (usa sessão do cookie)
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Service client para bypass de RLS
    const supabase = createServiceClient()

    const formData = await req.formData()
    const name = formData.get("name") as string
    const brand = formData.get("brand") as string
    const price = formData.get("price") as string
    const category = formData.get("category") as string
    const imageFile = formData.get("image") as File
    const galleryFiles = formData.getAll("gallery[]") as File[]

    if (!name || !category || !imageFile) {
      return NextResponse.json({ error: "Nome, categoria e imagem são obrigatórios" }, { status: 400 })
    }

    // Upload da imagem principal
    const imageUrl = await uploadFile(supabase, imageFile, "catalog")

    // Upload das imagens da galeria (em paralelo)
    const galleryUrls = galleryFiles.length > 0
      ? await Promise.all(galleryFiles.map((f) => uploadFile(supabase, f, "catalog")))
      : []

    // Inserir na tabela garments
    const { data: garment, error: insertError } = await supabase
      .from("garments")
      .insert({
        name,
        brand: brand || null,
        price: price ? parseFloat(price) : null,
        category,
        image_url: imageUrl,
        gallery_images: galleryUrls,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ garment })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const supabase = createServiceClient()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    const { error } = await supabase.from("garments").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
