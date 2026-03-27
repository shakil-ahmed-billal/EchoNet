"use client"

import { useParams } from "next/navigation"
import { useProduct, useInitiatePayment, useCreateOrder } from "@/hooks/use-marketplace"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, ArrowLeft, Star, Store, Truck, ShieldCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string }
  const { data: product, isLoading } = useProduct(id)
  const { mutate: initiatePayment, isPending: isPaying } = useInitiatePayment()
  const { mutate: createOrder, isPending: isOrdering } = useCreateOrder()
  const { user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return <div>Product not found</div>

  const handleBuyNow = () => {
    // 1. Create Order
    createOrder({
        storeId: product.store.id,
        items: [{ productId: product.id, quantity: 1 }],
        shippingAddress: { city: "Dhaka", address: "Sample Address" } // Mock
    }, {
        onSuccess: (order: any) => {
            // 2. Initiate Payment
            initiatePayment(order.id)
        }
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-8">
      <Link 
        href="/marketplace" 
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden border border-border/10 shadow-xl">
             {product.images?.[0] ? (
                <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                />
             ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    No Image Available
                </div>
             )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images?.slice(1).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border/10">
                   <Image src={img} alt="" fill className="object-cover" />
                </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 rounded-full">{product.category.name}</Badge>
                <div className="flex items-center text-sm text-yellow-500 ml-auto font-medium">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    4.8 (124 reviews)
                </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">{product.title}</h1>
            <p className="text-3xl font-bold text-primary">${product.price}</p>
          </div>

          <div className="flex flex-col gap-3">
             <h3 className="font-semibold text-lg flex items-center gap-2">
                Description
             </h3>
             <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
             </p>
          </div>

          <Card className="bg-card/40 border-border/20 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Store className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sold by</p>
                        <p className="font-semibold">{product.store.name}</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto rounded-full">
                        <Link href={`/store/${product.store.id}`}>Visit Store</Link>
                    </Button>
                </div>
                <div className="h-px bg-border/10" />
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Stock</p>
                        <p className="font-semibold">{product.stock} units available</p>
                    </div>
                </div>
                <div className="h-px bg-border/10" />
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold">EchoNet Safe Buy</p>
                        <p className="text-xs text-muted-foreground">Secure payment & easy returns</p>
                    </div>
                </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button 
                size="lg" 
                className="flex-1 rounded-2xl h-14 text-lg font-bold shadow-lg shadow-primary/20"
                onClick={handleBuyNow}
                disabled={isPaying || isOrdering || product.stock === 0}
            >
               {isPaying || isOrdering ? "Processing..." : "Buy Now"}
            </Button>
            <Button 
                size="lg" 
                variant="outline" 
                className="rounded-2xl h-14 w-full sm:w-14 px-0"
                disabled={product.stock === 0}
            >
               <ShoppingCart className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
