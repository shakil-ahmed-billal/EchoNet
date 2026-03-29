"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductStickyHeaderProps {
  product: any
  onBuyNow: () => void
  onMessageSeller: () => void
}

export function ProductStickyHeader({ product, onBuyNow, onMessageSeller }: ProductStickyHeaderProps) {
  const [isFixed, setIsFixed] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsFixed(scrollY > 400)
      
      const height = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollY / height) * 100
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div 
      className={cn(
        "fixed left-0 right-0 z-40 transition-all duration-700 transform border-b border-border/10",
        isFixed 
          ? "translate-y-0 opacity-100 bg-background/60 backdrop-blur-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] py-4 top-14 md:top-16" 
          : "-translate-y-full opacity-0 py-0 top-0"
      )}
    >
      {/* Scroll Progress Indicator */}
      <div className="absolute bottom-0 left-0 h-[2.5px] bg-primary/20 w-full overflow-hidden">
         <div 
           className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_12px_rgba(var(--primary),0.6)]" 
           style={{ width: `${scrollProgress}%` }} 
         />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative size-11 rounded-xl overflow-hidden shrink-0 border border-primary/20 shadow-lg shadow-primary/5">
             <img src={product.images?.[0]} alt="" className="object-cover w-full h-full" />
             <div className="absolute inset-0 bg-primary/5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="font-black text-sm tracking-tight truncate text-foreground/90">
               {product.store.name} <span className="text-muted-foreground/30 mx-1">—</span> {product.title}
            </h4>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-primary tracking-[0.2em]">Neural Connection Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-xl font-black tracking-tighter text-primary mr-2 hidden sm:block">
            ${product.price}
          </p>
          <div className="flex items-center gap-3">
             <Button 
               size="sm" 
               variant="outline" 
               className="rounded-2xl h-11 px-6 font-black text-[10px] transition-all active:scale-95 border-border/40 hover:bg-card/80 backdrop-blur-sm hidden md:flex items-center gap-2.5"
               onClick={onMessageSeller}
             >
               <MessageSquare className="size-4" /> Message Store
             </Button>
             <Button 
               size="sm" 
               className="rounded-2xl h-11 px-8 font-black text-[10px] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-2.5 bg-primary hover:bg-primary/95"
               onClick={onBuyNow}
             >
               <ShoppingCart className="size-4" /> Finalize Purchase
             </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
