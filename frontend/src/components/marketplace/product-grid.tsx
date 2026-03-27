"use client"

import { useProducts } from "@/hooks/use-marketplace"
import { ProductCard } from "./product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination-controls"

interface ProductGridProps {
  category?: string
  search?: string
  page: number
  onPageChange: (page: number) => void
}

export function ProductGrid({ category, search, page, onPageChange }: ProductGridProps) {
  const { data, isLoading } = useProducts({ 
    categoryId: category, 
    searchTerm: search, 
    page,
    limit: 12
  })

  // Normalize data for pagination handling
  const products: any[] = data?.data ?? (Array.isArray(data) ? data : [])
  const meta = data?.meta

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <Skeleton className="h-6 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-1/2 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/10 rounded-3xl border border-dashed border-border/60">
        <p className="text-xl font-black opacity-30 uppercase tracking-widest">No items found</p>
        <p className="text-sm text-muted-foreground mt-2 font-medium">Try a different category or search term.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product :any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {meta && (
        <Pagination 
          meta={{ ...meta, totalPages: meta.totalPages ?? Math.ceil(meta.total / 12) }} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  )
}
