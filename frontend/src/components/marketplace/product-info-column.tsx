"use client";

import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, ShoppingCart, Star, Store, User, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductInfoColumnProps {
  product: any;
  onBuyNow: () => void;
  onMessageSeller: () => void;
  isOrdering: boolean;
  isPaying: boolean;
}

export function ProductInfoColumn({
  product,
  onBuyNow,
  onMessageSeller,
  isOrdering,
  isPaying,
}: ProductInfoColumnProps) {
  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? (reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviewCount).toFixed(1)
    : "0.0";

  return (
    <div className="flex flex-col gap-5">
      {/* Title & Price Block */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
           <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground px-3 py-0.5 text-[10px] font-bold tracking-wider">
              {product.category.name}
           </Badge>
           <div className={cn(
             "flex items-center text-xs font-bold gap-1 ml-auto",
             reviewCount > 0 ? "text-amber-500" : "text-muted-foreground/30"
           )}>
              <Star className={cn("size-3.5", reviewCount > 0 && "fill-current")} />
              <span>{averageRating}</span>
              <span className="text-muted-foreground/40 font-medium ml-1">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
           </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
          {product.title}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-foreground tracking-tight">
            ${product.price}
          </span>
          <span className="text-sm font-semibold text-muted-foreground opacity-50">Incl. VAT</span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">About this product</h3>
        <p className="text-base text-muted-foreground font-medium leading-relaxed">
          {product.description}
        </p>
      </div>

      <div className="w-full h-px bg-border/40" />

      {/* Seller Information Card */}
      <Card className="rounded-2xl border-border/40 bg-card overflow-hidden shadow-sm">
         <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
               <Avatar className="size-12 rounded-xl border border-border/10 shadow-sm">
                  <AvatarImage src={product.store.owner.avatarUrl || product.store.owner.image} className="object-cover" />
                  <AvatarFallback className="rounded-xl font-bold bg-muted text-muted-foreground">
                     {product.store.name[0].toUpperCase()}
                  </AvatarFallback>
               </Avatar>
               <div className="flex flex-col min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground leading-none mb-1">Sold By</p>
                  <h4 className="font-bold text-lg truncate leading-tight tracking-tight hover:text-primary transition-colors cursor-pointer">
                     {product.store.name}
                  </h4>
               </div>
            </div>
            <Button 
               variant="outline" 
               size="sm" 
               className="rounded-xl font-bold text-xs px-4 h-9 border-border/60 hover:bg-muted/10 transition-all flex items-center gap-2"
               onClick={onMessageSeller}
            >
               <MessageSquare className="size-3.5" /> Message
            </Button>
         </CardContent>
      </Card>

      {/* Purchasing Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2 w-full">
         <Button 
            size="lg" 
            className="w-full h-14 rounded-xl font-bold text-base shadow-xl shadow-primary/10 transition-all active:scale-95 flex items-center justify-center gap-3"
            onClick={onBuyNow}
            disabled={isOrdering || isPaying || product.stock === 0}
         >
            {isOrdering || isPaying ? (
               "Processing..."
            ) : (
               <>
                  <CreditCard className="size-5" /> Buy Now
               </>
            )}
         </Button>
         <Button 
            size="lg" 
            variant="outline"
            className="w-full rounded-xl h-14 font-bold text-base border-border/60 hover:bg-muted/10 transition-all active:scale-95 flex items-center justify-center gap-3"
         >
            <ShoppingCart className="size-5" /> Add to Cart
         </Button>
      </div>

      {/* Stock Info */}
      <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/60  pt-4">
          <div className="flex items-center gap-1.5"><Store className="size-4" /> Official Store</div>
          <div className="flex items-center gap-1.5 ml-auto">
             <span className={product.stock > 0 ? "text-emerald-500" : "text-red-500"}>
               {product.stock > 0 ? `${product.stock} units in stock` : "Out of stock"}
             </span>
          </div>
      </div>
    </div>
  );
}
