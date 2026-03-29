"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const tranId = searchParams.get("tran_id") || searchParams.get("session_id")

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/20 animate-in zoom-in-50 duration-500">
            <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
        </div>
      </div>
      
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-black tracking-tight">Payment Successful!</h1>
        <p className="text-muted-foreground font-medium text-lg leading-relaxed">
          Thank you for your purchase. Your order has been placed successfully and is being processed by the seller.
        </p>
      </div>

      {tranId && (
        <div className="bg-muted/50 px-6 py-3 rounded-2xl flex items-center gap-3 border border-border/10">
          <span className="text-[10px] font-black text-muted-foreground">Transaction ID</span>
          <span className="font-mono font-bold text-sm text-primary">{tranId}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Link href="/marketplace">
          <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-2 hover:bg-muted transition-all">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continue Shopping
          </Button>
        </Link>
        <Link href="/profile">
          <Button className="h-14 px-8 rounded-2xl font-black shadow-lg shadow-primary/20">
            View My Orders
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[70vh]">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
