import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-server"
import { formatPrice } from "@/lib/utils"
import type { CartItem } from "@/types"

async function getCartItems(): Promise<CartItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("cart_items")
    .select("*, garment:garments(*), tryon_result:tryon_results(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return data ?? []
}

export default async function CartPage() {
  const items = await getCartItems()

  const total = items.reduce(
    (sum, item) => sum + (item.garment?.price ?? 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carrinho</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-16 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">
              Seu carrinho está vazio
            </p>
            <p className="text-sm text-muted-foreground/70">
              Experimente roupas e adicione ao carrinho
            </p>
          </div>
          <Link href="/try-on">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Experimentar agora
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex gap-4 p-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.tryon_result?.result_image_url ? (
                      <Image
                        src={item.tryon_result.result_image_url}
                        alt="Look"
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : item.garment?.image_url ? (
                      <Image
                        src={item.garment.image_url}
                        alt={item.garment.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-medium">{item.garment?.name}</p>
                      {item.garment?.brand && (
                        <p className="text-sm text-muted-foreground">
                          {item.garment.brand}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {item.garment?.price != null && (
                        <p className="font-semibold text-primary">
                          {formatPrice(item.garment.price)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardContent className="space-y-4 p-4">
                <h2 className="font-semibold">Resumo do pedido</h2>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
                <Button className="w-full">Finalizar compra</Button>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    Continuar comprando
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
