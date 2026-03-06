"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shirt, Heart, ShoppingCart, Sparkles, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
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
                className={cn("gap-2", pathname === href && "text-primary font-semibold")}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile nav — bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-white/90 backdrop-blur-sm md:hidden">
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
