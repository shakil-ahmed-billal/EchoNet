"use client"

import { useProducts } from "@/hooks/use-marketplace"
import { ProductCard } from "./product-card"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductGridProps {
  category?: string
  search?: string
}

export function ProductGrid({ category, search }: ProductGridProps) {
  const { data: products, isLoading } = useProducts({ category, searchTerm: search })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (products?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-semibold opacity-50">No items found</p>
        <p className="text-sm text-muted-foreground mt-1">Try a different category or search term</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products?.map((product :any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
