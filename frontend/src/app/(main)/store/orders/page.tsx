"use client"

import { useMyStore, useStoreOrders } from "@/hooks/use-marketplace"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Store as StoreIcon, ShoppingCart, ArrowLeft, Package, User } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

export default function StoreOrdersPage() {
  const { data: store, isLoading: isStoreLoading } = useMyStore()
  const { data: orders, isLoading: isOrdersLoading } = useStoreOrders()

  if (isStoreLoading || isOrdersLoading) {
    return (
      <div className="mx-auto max-w-5xl py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!store && !isStoreLoading) {
    return (
      <div className="py-20 text-center">
        <StoreIcon className="w-16 h-16 mx-auto mb-4 text-primary/50" />
        <h1 className="text-2xl font-bold mb-2">No Store Found</h1>
        <p className="text-muted-foreground mb-6">You need to create a store before you can view orders.</p>
        <Link href="/store">
          <Button className="rounded-2xl">Go to Store Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex flex-col gap-8 pb-12 w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-4">
        <Link href="/store">
            <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
            </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Orders</h1>
          <p className="text-sm text-muted-foreground">Manage your customer purchases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <Card key={order.id} className="bg-card/40 backdrop-blur-sm border-border/20 rounded-3xl overflow-hidden shadow-sm p-0">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 py-4">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                {order.status}
                            </span>
                        </CardTitle>
                        <CardDescription>Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy - h:mm a')}</CardDescription>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold text-primary">${Number(order.totalAmount || 0).toFixed(2)}</p>
                    </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary" />
                            Order Items
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 items-center p-3 bg-background/50 rounded-2xl border border-border/40">
                                    {item.product?.images?.[0] ? (
                                        <img src={item.product.images[0]} alt={item.product?.title || "Item"} className="w-16 h-16 rounded-xl object-cover border border-border/50" />
                                    ) : (
                                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                            <Package className="w-6 h-6 text-primary/50" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm line-clamp-1">{item.product?.title || "Unknown Product"}</p>
                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${item.unitPrice}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">${item.subtotal}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                Customer Info
                            </h3>
                            <div className="p-4 bg-background/50 rounded-2xl border border-border/40">
                                <div className="flex items-center gap-3">
                                    {order.buyer?.avatarUrl ? (
                                        <img src={order.buyer.avatarUrl} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4 text-primary/50" />
                                        </div>
                                    )}
                                    <p className="font-semibold text-sm line-clamp-1">{order.buyer?.name || "Customer"}</p>
                                </div>
                            </div>
                        </div>

                        {order.shippingAddress && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Shipping Address</h3>
                                <div className="p-4 bg-background/50 rounded-2xl border border-border/40 text-sm">
                                    <p className="font-medium text-foreground">{order.shippingAddress.street}</p>
                                    <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                    <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-card/40 backdrop-blur-sm border border-border/20 rounded-3xl">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-primary/40" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground text-center max-w-sm">
              When customers purchase products from your store, their orders will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
