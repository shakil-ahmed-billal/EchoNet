"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { NavItem } from "@/types/nav"
import { useAuth } from "@/hooks/use-auth"
import { UserImage } from "./user-image"
import { LogOut } from "lucide-react"
import { Separator } from "./ui/separator"
import { SiteMark } from "./SiteMark"

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user: currentUser, logout, isLoggingOut } = useAuth()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="sm:hidden size-10 rounded-full text-foreground hover:bg-muted/80 active:scale-90 transition-all">
          <Menu className="h-[22px] w-[22px]" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      {/* hideCloseButton removes the default X from SheetContent */}
      <SheetContent side="left" className="p-0 border-r border-border/20 w-[300px] sm:w-[320px] bg-background/98 backdrop-blur-xl" showCloseButton={false}>
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full">

          {/* Header: Logo */}
          <div className="p-5 flex items-center justify-between border-b border-border/20">
            <Link href="/" onClick={() => setOpen(false)}>
              <SiteMark className="h-9 w-auto" />
            </Link>
          </div>

          {/* Profile Section */}
          {isAuthenticated && currentUser && (
            <Link
              href={`/profile/${currentUser.id}`}
              onClick={() => setOpen(false)}
              className="p-5 flex items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <UserImage user={currentUser} className="size-11 ring-2 ring-border/20" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-foreground truncate leading-snug">
                  {currentUser?.name}
                </span>
                <span className="text-xs text-muted-foreground truncate mt-0.5">
                  View your profile
                </span>
              </div>
            </Link>
          )}

          <Separator className="bg-border/20" />

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto py-2">
            <div className="flex flex-col">
              {items.map((item) => {
                // Dynamically replace /profile with the actual user's profile URL
                const href = item.href === "/profile" && currentUser?.id
                  ? `/profile/${currentUser.id}`
                  : item.href
                return (
                  <Link
                    key={item.href}
                    href={href}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-foreground/80 hover:bg-muted/50 hover:text-foreground transition-colors active:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    {item.icon && <item.icon className="size-5 shrink-0 text-muted-foreground" />}
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>

            {!isAuthenticated && (
              <div className="flex flex-col gap-3 p-5 mt-2 border-t border-border/20">
                <Link
                  href="/login"
                  className="flex items-center justify-center h-11 px-4 rounded-xl text-sm font-bold border border-border/40 hover:bg-muted/50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center h-11 px-4 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Footer / Logout */}
          {isAuthenticated && (
            <div className="p-3 border-t border-border/20">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 rounded-xl text-sm font-semibold text-destructive/80 hover:text-destructive hover:bg-destructive/5 transition-colors"
                onClick={() => { logout(); setOpen(false) }}
                disabled={isLoggingOut}
              >
                <LogOut className="size-4 shrink-0" />
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
