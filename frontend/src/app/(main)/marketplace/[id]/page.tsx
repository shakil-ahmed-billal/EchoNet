"use client"

import { useParams } from "next/navigation"
import { useProduct, useInitiatePayment, useCreateOrder, useCreateReview } from "@/hooks/use-marketplace"
import { useAuth } from "@/hooks/use-auth"
import { useMessenger } from "@/components/messages/messenger-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Modular Components
import { ProductGallery } from "@/components/marketplace/product-gallery"
import { ProductInfoColumn } from "@/components/marketplace/product-info-column"
import { ProductReviewsSection } from "@/components/marketplace/product-reviews-section"

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string }
  const { data: product, isLoading } = useProduct(id)
  const { mutate: initiatePayment, isPending: isPaying } = useInitiatePayment()
  const { mutate: createOrder, isPending: isOrdering } = useCreateOrder()
  const { mutate: createReview, isPending: isSubmittingReview } = useCreateReview()
  const { user: currentUser } = useAuth()
  const { openChat } = useMessenger()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10 w-full animate-pulse">
        <Skeleton className="h-6 w-48 rounded-xl bg-muted/20" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mt-4">
          <Skeleton className="aspect-square rounded-2xl bg-muted/20" />
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-xl bg-muted/20" />
              <Skeleton className="h-6 w-1/3 rounded-lg bg-muted/20" />
            </div>
            <Skeleton className="h-32 w-full rounded-2xl bg-muted/20" />
            <Skeleton className="h-24 w-full rounded-2xl bg-muted/20" />
            <Skeleton className="h-14 w-full rounded-xl bg-muted/20" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="size-16 bg-muted/10 rounded-2xl flex items-center justify-center border border-border/10 shadow-sm">
          <ArrowLeft className="size-8 text-muted-foreground/30" />
       </div>
       <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold opacity-30">Product Not Found</h2>
          <p className="text-muted-foreground font-medium max-w-sm">The requested item dose not exist in our distribution hub.</p>
       </div>
       <Link href="/marketplace" className="mt-4 px-8 h-12 bg-primary text-white rounded-xl flex items-center font-bold shadow-sm transition-all hover:scale-105 active:scale-95">Return to Marketplace</Link>
    </div>
  )

  const handleBuyNow = () => {
    if (!currentUser) return toast.error("Please login to proceed with purchase")
    createOrder({
        storeId: product.store.id,
        items: [{ productId: product.id, quantity: 1 }],
        shippingAddress: { city: "Dhaka", address: "Dhaka, Bangladesh" }
    }, {
        onSuccess: (order: any) => initiatePayment(order.id)
    })
  }

  const handleMessageSeller = () => {
    if (!currentUser) return toast.error("Please login to message the seller")
    if (product.store?.owner) {
        openChat({
            id: product.store.owner.id,
            name: product.store.owner.name,
            image: product.store.owner.avatarUrl || product.store.owner.image
        })
    }
  }

  const handleSubmitReview = (rating: number, comment: string) => {
     createReview({ productId: id, data: { rating, comment } })
  }

  return (
    <div className="flex h-full flex-col max-w-7xl mx-auto w-full relative pb-20">
      {/* Search Header Space Refill (Optional if site header is persistent) */}
      
      {/* Breadcrumbs - Clean UI */}
      <nav className="flex items-center gap-3 text-xs text-muted-foreground/60  mb-5 overflow-hidden">
        <Link href="/marketplace" className="hover:text-primary transition-colors shrink-0">Marketplace</Link>
        <ChevronRight className="size-3 shrink-0" />
        <Link href={`/marketplace/category/${product.category.id}`} className="hover:text-primary transition-colors shrink-0">{product.category.name}</Link>
        <ChevronRight className="size-3 shrink-0" />
        <span className="text-foreground/40 truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10 items-start">
        {/* Left Column: Essential Imagery */}
        <ProductGallery images={product.images || []} title={product.title} />

        {/* Right Column: Unified Info & Merchant Section */}
        <ProductInfoColumn 
           product={product} 
           onBuyNow={handleBuyNow} 
           onMessageSeller={handleMessageSeller}
           isOrdering={isOrdering}
           isPaying={isPaying}
        />
      </div>

      {/* Simplified Review Interface */}
      <div className="mt-20 border-t border-border/40 pt-16">
        <ProductReviewsSection 
          product={product} 
          onSubmitReview={handleSubmitReview} 
          isSubmitting={isSubmittingReview} 
        />
      </div>
    </div>
  )
}
