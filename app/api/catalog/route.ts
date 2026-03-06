import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: garments, error } = await supabase
      .from("garments")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ garments: garments ?? [] })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
