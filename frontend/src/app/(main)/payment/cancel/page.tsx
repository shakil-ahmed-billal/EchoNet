"use client"

import { Button } from "@/components/ui/button"
import { XCircle, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function CancelContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-6">
      <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground/40">
          <XCircle className="w-12 h-12" />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-black tracking-tight uppercase">Payment Cancelled</h1>
        <p className="text-muted-foreground font-medium text-lg leading-relaxed">
          Your payment process was cancelled. Your items are still saved in your cart if you'd like to try again later.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Link href="/checkout">
          <Button className="h-14 px-8 rounded-2xl font-black shadow-lg shadow-primary/20">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Checkout
          </Button>
        </Link>
        <Link href="/marketplace">
          <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[70vh]">Loading...</div>}>
      <CancelContent />
    </Suspense>
  )
}
