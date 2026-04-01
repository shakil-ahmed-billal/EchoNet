"use client"

import { useMyOrders } from "@/hooks/use-marketplace"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Package, Truck, Loader2, Store, Clock, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function MyOrdersList() {
  const { data: myOrders, isLoading } = useMyOrders()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary/30" /></div>
    )
  }

  if (!myOrders || myOrders.length === 0) {
    return (
      <div className="bg-card/60 backdrop-blur-sm md:rounded-2xl border border-border/20 p-20 text-center flex flex-col items-center">
        <Package className="size-12 text-muted-foreground/20 mb-4" />
        <p className="text-sm font-bold text-muted-foreground/40">No orders yet</p>
        <Link href="/marketplace" className="mt-6">
          <Button className="rounded-xl px-8 h-10 font-bold shadow-md shadow-primary/20">
            Explore Marketplace
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full">
      {myOrders.map((order: any) => (
        <Card key={order.id} className="bg-card/60 backdrop-blur-sm border border-border/20 shadow-sm md:rounded-2xl overflow-hidden p-0 flex flex-col">
          <div className="p-4 md:p-6 bg-muted/20 flex items-center justify-between border-b border-border/10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Order</span>
                <span className="text-[10px] font-mono font-bold text-foreground bg-background px-2 py-0.5 rounded-full border border-border/20">
                  #{order.id.split('-')[0].toUpperCase()}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                  order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                  order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">
                {format(new Date(order.createdAt), "MMM d, yyyy")}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold text-primary">${Number(order.totalAmount || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <Store className="size-3.5 text-primary" />
              <Link href={`/store/${order.store.id}`} className="text-xs font-bold hover:text-primary transition-colors">
                {order.store.name}
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center bg-muted/10 p-3 rounded-xl hover:bg-muted/20 transition-colors">
                  <div className="size-12 rounded-lg overflow-hidden border border-border/10 shrink-0">
                    <Image 
                      src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"} 
                      alt={item.product?.title || "Product"} 
                      width={48} 
                      height={48} 
                      className="object-cover size-full" 
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <Link href={`/marketplace/${item.product?.id}`} className="hover:text-primary transition-colors">
                      <h5 className="text-xs font-bold truncate">{item.product?.title || "Product Unavailable"}</h5>
                    </Link>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {item.quantity} × ${Number(item.price || item.product?.price || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs font-bold">
                    ${(item.quantity * Number(item.price || item.product?.price || 0)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

