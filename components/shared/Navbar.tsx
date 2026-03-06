"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Shirt, Heart, ShoppingCart, LogOut, Sparkles, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Catálogo", icon: Shirt },
  { href: "/try-on", label: "Experimentar", icon: Sparkles },
  { href: "/favorites", label: "Favoritos", icon: Heart },
  { href: "/cart", label: "Carrinho", icon: ShoppingCart },
  { href: "/admin", label: "Admin", icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">Try It On</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  pathname === href && "text-primary font-semibold"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>

      {/* Mobile nav */}
      <nav className="flex border-t md:hidden">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex-1">
            <div
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground transition-colors",
                pathname === href && "text-primary font-semibold"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </div>
          </Link>
        ))}
      </nav>
    </header>
  )
}
