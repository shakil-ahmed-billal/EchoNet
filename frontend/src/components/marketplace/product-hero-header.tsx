"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Store, MapPin, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductHeroHeaderProps {
  product: any
  onMessageSeller: () => void
}

export function ProductHeroHeader({ product, onMessageSeller }: ProductHeroHeaderProps) {
  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? (reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviewCount).toFixed(1)
    : "0.0";

  return (
    <div className="w-full bg-card/30 border border-border/10 rounded-[2.5rem] p-7 mb-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/5 to-transparent pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
           <div className="relative shrink-0">
              <Avatar className="size-20 rounded-2xl ring-4 ring-primary/10 border-2 border-background shadow-2xl transition-transform duration-500 group-hover:scale-105">
                 <AvatarImage src={product.store.owner.avatarUrl || product.store.owner.image} className="object-cover" />
                 <AvatarFallback className="rounded-2xl font-black bg-primary/5 text-primary text-2xl">
                    {product.store.name[0].toUpperCase()}
                 </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 size-6 bg-emerald-500 border-[3px] border-background rounded-full shadow-lg flex items-center justify-center">
                 <div className="size-2 bg-white rounded-full animate-pulse" />
              </div>
           </div>
           
           <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                 <h2 className="text-3xl font-black tracking-tight text-foreground/90">
                   {product.store.name} <span className="text-muted-foreground/30 mx-1">—</span> {product.title}
                 </h2>
                 <Badge variant="outline" className="h-6 text-[10px] font-black text-primary border-primary/30 bg-primary/5 px-3 rounded-full">Global Merchant</Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-xs font-black text-muted-foreground/50 tracking-[0.15em]">
                 <span className="flex items-center gap-2 transition-colors hover:text-primary"><Store className="size-4" /> Official Brand</span>
                 <span className="flex items-center gap-2 transition-colors hover:text-primary"><MapPin className="size-4" /> EcoNet Distribution</span>
                 <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full border",
                    reviewCount > 0 ? "bg-amber-500/10 text-amber-600 border-amber-500/10" : "bg-muted/10 text-muted-foreground/30 border-border/10"
                 )}>
                    <Star className={cn("size-3.5", reviewCount > 0 && "fill-current")} />
                    <span>{averageRating} TRADING RATING</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <Button 
             className="flex-1 md:flex-none h-16 px-10 rounded-2xl font-black text-base shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-4 bg-primary hover:bg-primary/95"
             onClick={onMessageSeller}
           >
              <MessageSquare className="size-6" /> Message Store
           </Button>
           <Button 
             variant="outline" 
             className="size-16 rounded-2xl border-border/40 hover:bg-card/80 transition-all hover:scale-105 active:scale-95 shadow-xl hidden sm:flex items-center justify-center backdrop-blur-sm"
           >
              <Store className="size-7" />
           </Button>
        </div>
      </div>
    </div>
  )
}
