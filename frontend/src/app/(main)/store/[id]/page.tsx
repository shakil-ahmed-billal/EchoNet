"use client"

import { useStore, useProducts } from "@/hooks/use-marketplace"
import { ProductCard } from "@/components/marketplace/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Store as StoreIcon, Package, Users, Info, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function StorePreviewPage() {
  const params = useParams()
  const storeId = params.id as string

  const { data: store, isLoading: isStoreLoading } = useStore(storeId)
  const { data: products, isLoading: isProductsLoading } = useProducts({ storeId })

  if (isStoreLoading) {
    return (
      <div className="flex flex-col gap-6 w-full pb-12">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!store && !isStoreLoading) {
    return (
      <div className="mx-auto flex flex-col items-center justify-center py-20 text-center">
        <StoreIcon className="w-16 h-16 mx-auto mb-4 text-primary/50" />
        <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
        <p className="text-muted-foreground mb-6">The store you are looking for does not exist or has been removed.</p>
        <Link href="/store">
          <Button className="rounded-2xl">Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full">
      <div className="flex items-center gap-4">
        <Link href="/store">
            <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
            </Button>
        </Link>
        <h1 className="text-2xl font-bold">Store Profile</h1>
      </div>

      {/* Store Header / Profile */}
      <div className="relative bg-card/40 backdrop-blur-sm border-border/20 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row gap-6 p-6 sm:p-10">
        <div className="shrink-0">
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-primary/10 rounded-4xl flex items-center justify-center text-primary mx-auto md:mx-0 shadow-lg border-4 border-background">
            {store.logoUrl ? (
                <img src={store.logoUrl} className="w-full h-full rounded-4xl object-cover" alt={store.name} />
            ) : (
                <StoreIcon className="w-12 h-12 sm:w-16 sm:h-16" />
            )}
          </div>
        </div>
        
        <div className="flex flex-col flex-1 justify-center text-center md:text-left gap-4">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{store.name}</h1>
                <p className="text-muted-foreground max-w-2xl">{store.description || "Welcome to my store! Check out my amazing products."}</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl text-sm font-semibold">
                    <Package className="w-4 h-4 text-primary" />
                    {store._count?.products || 0} Products
                </div>
                <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl text-sm font-semibold">
                    <Users className="w-4 h-4 text-primary" />
                    {store._count?.followers || store.followersCount || 0} Followers
                </div>
            </div>
        </div>

        <div className="md:absolute md:top-6 md:right-6 flex justify-center w-full md:w-auto">
            <Button className="rounded-xl font-bold shadow-md md:w-auto w-full">
                Follow Store
            </Button>
        </div>
      </div>

      {/* Store Products */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Products Listing
        </h2>
      </div>

      {isProductsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-[300px] rounded-3xl" />
            <Skeleton className="h-[300px] rounded-3xl" />
            <Skeleton className="h-[300px] rounded-3xl" />
            <Skeleton className="h-[300px] rounded-3xl" />
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/40 border border-border/20 rounded-3xl shadow-sm">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <Info className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Products Yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
                This store hasn&apos;t added any products to their inventory yet. Check back soon!
            </p>
        </div>
      )}
    </div>
  )
}
