"use client"

import { useMyOrders } from "@/hooks/use-marketplace"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { format } from "date-fns"
import { Package, Truck, Loader2, Store, Clock, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function MyOrdersList() {
  const { data: myOrders, isLoading } = useMyOrders()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-bold">Loading secure orders...</p>
      </div>
    )
  }

  if (!myOrders || myOrders.length === 0) {
    return (
      <Card className="rounded-[32px] border-none bg-card/50 backdrop-blur-md shadow-sm p-0">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center opacity-70">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">No Orders Yet</h3>
          <p className="text-muted-foreground mt-2 font-medium">You haven't purchased anything yet. Head to the Marketplace to discover amazing products!</p>
          <Link href="/marketplace" className="mt-8 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            Explore Marketplace
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {myOrders.map((order: any) => (
        <Card key={order.id} className="rounded-[32px] border border-border/40 bg-card shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 group p-0">
          <CardHeader className="bg-muted/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-muted-foreground">Order ID</span>
                <span className="text-xs font-mono font-medium text-foreground bg-background px-3 py-1 rounded-full border border-border/50">
                  {order.id.split('-')[0].toUpperCase()}
                </span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                  order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {order.status === 'DELIVERED' ? <Zap className="w-3 h-3" /> :
                   order.status === 'SHIPPED' ? <Truck className="w-3 h-3" /> :
                   <Clock className="w-3 h-3" />}
                  {order.status}
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                Placed on {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center">
              <span className="text-[10px] font-black text-muted-foreground">Order Total</span>
              <span className="text-2xl font-black text-primary">${Number(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Store className="w-4 h-4 text-primary" />
              <Link href={`/store/${order.store.id}`} className="text-sm font-bold hover:text-primary hover:underline transition-all">
                Sold by {order.store.name}
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center bg-muted/20 p-4 rounded-2xl group-hover:bg-muted/40 transition-colors">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-background shrink-0 shadow-sm border border-border/50">
                    <Image 
                      src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"} 
                      alt={item.product?.title || "Product"} 
                      width={64} 
                      height={64} 
                      className="object-cover h-full w-full" 
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <Link href={`/marketplace/${item.product?.id}`} className="hover:text-primary transition-colors w-fit">
                      <h5 className="text-sm font-bold line-clamp-1">{item.product?.title || "Product Unavailable"}</h5>
                    </Link>
                    <p className="text-[11px] text-muted-foreground font-medium mt-1 tracking-wider">
                      Qty: {item.quantity} × ${Number(item.price || item.product?.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="font-black">
                    ${(item.quantity * Number(item.price || item.product?.price || 0)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
