"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, ShoppingBag, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function FailContent() {
  const searchParams = useSearchParams()
  const tranId = searchParams.get("tran_id")

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-6">
      <div className="relative">
        <div className="absolute inset-0 bg-destructive/10 blur-3xl rounded-full scale-150" />
        <div className="relative w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center text-destructive animate-in zoom-in-75">
            <AlertCircle className="w-12 h-12" />
        </div>
      </div>
      
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-black tracking-tight uppercase">Payment Failed</h1>
        <p className="text-muted-foreground font-medium text-lg leading-relaxed">
          We encountered an error while processing your payment. Don't worry, no money has been deducted from your account.
        </p>
      </div>

      {tranId && (
        <div className="bg-muted/50 px-6 py-3 rounded-2xl flex items-center gap-3 border border-border/10">
          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Reference ID</span>
          <span className="font-mono font-bold text-sm">{tranId}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Link href="/checkout">
          <Button className="h-14 px-8 rounded-2xl font-black shadow-lg shadow-primary/20">
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Checkout Again
          </Button>
        </Link>
        <Link href="/marketplace">
          <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Browse Items
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[70vh]">Loading...</div>}>
      <FailContent />
    </Suspense>
  )
}
