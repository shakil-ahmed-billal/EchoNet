"use client"

import Image from "next/image"
import Link from "next/link"
import { Product } from "@/services/marketplace.service"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart } from "lucide-react"

import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  // Clean up title by removing store name prefix if present
  const cleanTitle = product.title.startsWith(`${product.store.name} - `) 
    ? product.title.replace(`${product.store.name} - `, "") 
    : product.title;

  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? (reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviewCount).toFixed(1)
    : "0.0";

  const firstImage = product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      title: cleanTitle,
      price: product.price,
      quantity: 1,
      image: firstImage,
      storeId: product.store.id,
      storeName: product.store.name
    })
    toast.success(`${cleanTitle} added to cart!`)
  }

  return (
    <Card className="group overflow-hidden border-none bg-background shadow-none hover:shadow-xl transition-all duration-500 rounded-3xl flex flex-col  p-0">
      <Link href={`/marketplace/${product.id}`} className="block relative">
        <div className="relative aspect-square overflow-hidden rounded-t-3xl bg-muted/30">
          <Image
            src={firstImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Pill - Floating */}
          <Badge className="absolute top-4 left-4 h-7 bg-white/90 dark:bg-black/90 text-foreground backdrop-blur-md border-none px-3 font-semibold text-[10px] rounded-full shadow-sm">
            {product.category.name}
          </Badge>

          {/* Price - Elegant corner placement */}
          <div className="absolute bottom-4 right-4 h-9 px-4 bg-primary text-primary-foreground backdrop-blur-md flex items-center justify-center font-bold text-sm rounded-2xl shadow-lg shadow-primary/20">
            ${Number(product.price).toLocaleString()}
          </div>
        </div>
      </Link>

      <CardContent className="flex-1 flex flex-col p-5 gap-1">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium mb-1">
          <Link href={`/store/${product.store.id}`} className="hover:text-primary transition-colors flex items-center gap-1.5 overflow-hidden">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="truncate">{product.store.name}</span>
          </Link>
          <span className="opacity-30">•</span>
          <div className={cn(
            "flex items-center shrink-0",
            reviewCount > 0 ? "text-amber-500" : "text-muted-foreground/20"
          )}>
            <Star className={cn("w-3 h-3 mr-1", reviewCount > 0 && "fill-current")} />
            {averageRating}
          </div>
        </div>

        <Link href={`/marketplace/${product.id}`}>
          <h3 className="text-lg font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
            {cleanTitle}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-2 font-medium opacity-80">
          {product.description}
        </p>
      </CardContent>

      <CardFooter className="p-5 mt-auto flex items-center gap-3">
        <Link href={`/marketplace/${product.id}`} className="flex-1">
          <Button className="w-full h-11 rounded-2xl bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground font-bold border-none transition-all duration-300 text-sm shadow-sm group-hover:shadow-md">
            View Details
          </Button>
        </Link>
        <Button 
          size="icon" 
          onClick={handleAddToCart}
          className="h-11 w-11 rounded-2xl bg-primary/5 hover:bg-primary hover:text-primary-foreground border-none text-primary transition-all duration-300"
        >
          <ShoppingCart className="w-5 h-5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
