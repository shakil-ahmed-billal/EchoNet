"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MAIN_NAV, SITE_INFO } from "@/config/site"
import { ThemeToggle } from "./theme-toggle"
import { MobileNav } from "./mobile-nav"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl tracking-tight">{SITE_INFO.name}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="max-sm:hidden flex items-center gap-6 text-sm font-medium">
          {MAIN_NAV.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  isActive ? "text-foreground" : "text-foreground/60"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav items={MAIN_NAV} />
        </div>
      </div>
    </header>
  )
}
