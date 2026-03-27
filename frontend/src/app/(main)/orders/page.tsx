"use client"

import { MyOrdersList } from "@/components/marketplace/my-orders-list"

export default function MyOrdersPage() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight">My Orders</h1>
        <p className="text-muted-foreground font-medium">Track your recent purchases, view delivery status, and manage your bought items.</p>
      </div>
      
      <MyOrdersList />
    </div>
  )
}
