"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { NavItem } from "@/types/nav"

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="sm:hidden px-0 pl-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col gap-6 pt-6">
          <Link href="/" className="font-bold text-xl" onClick={() => setOpen(false)}>
            EchoNet
          </Link>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium hover:text-primary transition-colors text-foreground/80"
                onClick={() => setOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
