"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, Mail, Plus } from "lucide-react"
import { SITE_INFO } from "@/config/site"
import { ThemeToggle } from "./theme-toggle"
import { MobileNav } from "./mobile-nav"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "./ui/button"
import { UserNav } from "./user-nav"
import { Input } from "./ui/input"

export function SiteHeader() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl h-16 flex items-center shadow-sm">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 sm:gap-10">
          <Link href="/" className="flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
               <span className="text-primary-foreground font-black text-xl">E</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden lg:block text-foreground/90">{SITE_INFO.name}</span>
          </Link>
          
          {/* Search Bar - Premium Modern Look */}
          <div className="hidden md:flex items-center relative group min-w-[200px] lg:min-w-[320px]">
             <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <Input 
              type="text" 
              placeholder="Search EchoNet..." 
              className="h-10 pl-10 bg-muted/40 border-border/20 focus:bg-card focus:border-primary/40 rounded-full transition-all text-sm placeholder:text-muted-foreground/60 w-full shadow-inner"
             />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex items-center gap-1">
                   <Button variant="ghost" size="icon" className="size-10 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground">
                      <Plus className="size-5" />
                   </Button>
                   <Button variant="ghost" size="icon" className="size-10 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground">
                      <Bell className="size-5" />
                   </Button>
                   <Button variant="ghost" size="icon" className="size-10 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground">
                      <Mail className="size-5" />
                   </Button>
                </div>
                <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />
                <UserNav />
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-bold rounded-xl px-5 h-9">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-xs font-bold rounded-xl px-6 h-9 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">Get Started</Button>
                </Link>
              </div>
            )}
            
            <div className="h-6 w-px bg-border/40 mx-1 hidden md:block" />
            <div className="hidden md:flex items-center">
               <ThemeToggle />
            </div>
            <div className="md:hidden">
               <MobileNav items={[]} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
