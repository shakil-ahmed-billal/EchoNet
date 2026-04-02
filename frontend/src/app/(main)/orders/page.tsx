"use client"

import { MyOrdersList } from "@/components/marketplace/my-orders-list"
import { Package } from "lucide-react"

export default function MyOrdersPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-4xl mx-auto w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header Card */}
      <div className="bg-card/60 backdrop-blur-sm md:rounded-2xl border border-border/20 shadow-sm p-4 md:p-6 flex items-center gap-4">
        <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
          <Package className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Orders</h1>
          <p className="text-sm text-muted-foreground font-medium">Track your recent purchases</p>
        </div>
      </div>
      
      <MyOrdersList />
    </div>
  )
}
