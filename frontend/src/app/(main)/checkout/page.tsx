"use client"

import { useCart } from "@/hooks/use-cart"
import { useCreateOrder, useInitiatePayment } from "@/hooks/use-marketplace"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ShoppingBag, ChevronLeft, CreditCard, MapPin, Truck, ShieldCheck, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useCreateOrder()
  const { mutateAsync: initiatePayment, isPending: isInitiatingPayment } = useInitiatePayment()
  const router = useRouter()

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: ""
  })

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">Add some items to your cart before checking out.</p>
        <Link href="/marketplace">
            <Button className="rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
                Back to Marketplace
            </Button>
        </Link>
      </div>
    )
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 1. Group items by storeId
      const itemsByStore: Record<string, typeof items> = {}
      let hasMissingStoreId = false

      items.forEach(item => {
        if (!item.storeId) {
            hasMissingStoreId = true
            return
        }
        const storeKey = item.storeId
        if (!itemsByStore[storeKey]) itemsByStore[storeKey] = []
        itemsByStore[storeKey].push(item)
      })

      if (hasMissingStoreId) {
          toast.error("Some items in your cart have missing store information. Please remove and re-add them.")
          return
      }

      const storeIds = Object.keys(itemsByStore)
      
      if (storeIds.length === 0) {
          toast.error("No valid items found in cart.")
          return
      }

      toast.info(`Placing orders for ${storeIds.length} store(s)...`)

      // For this implementation, we will process the orders.
      // If there are multiple stores, we create multiple orders.
      // But we can only initiate one payment at a time with the current backend.
      // So we'll create all orders and initiate payment for the first one.

      let firstOrderId = ""

      for (const storeId of storeIds) {
        const storeItems = itemsByStore[storeId]
        const orderData = {
          storeId,
          items: storeItems.map(item => ({
            productId: item.id,
            quantity: item.quantity
          })),
          shippingAddress
        }

        const order = await createOrder(orderData)
        if (!firstOrderId && order?.id) {
          firstOrderId = order.id
        }
      }
      
      if (firstOrderId) {
        toast.info("Initiating secure payment...")
        const payment = await initiatePayment(firstOrderId)
        if (payment && payment.url) {
          clearCart()
          window.location.href = payment.url
        }
      }

    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Something went wrong during checkout")
    }
  }

  return (
    <div className=" mx-auto  flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <Link href="/marketplace" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2 w-fit">
            <ChevronLeft className="w-4 h-4" />
            Back to Marketplace
        </Link>
        <h1 className="text-4xl font-black tracking-tight">Checkout</h1>
        <p className="text-muted-foreground font-medium">Complete your order by providing shipping and payment details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Shipping Form */}
            <Card className="rounded-[32px] border-none bg-card/50 backdrop-blur-md shadow-sm">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <MapPin className="w-5 h-5" />
                        <span className="text-xs font-black tracking-wider">Shipping Details</span>
                    </div>
                    <CardTitle className="text-2xl font-black">Where should we send it?</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                                id="name" 
                                placeholder="John Doe" 
                                className="h-12 rounded-2xl bg-background/50 border-none focus-visible:ring-primary/20"
                                value={shippingAddress.name}
                                onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                                id="email" 
                                type="email"
                                placeholder="john@example.com" 
                                className="h-12 rounded-2xl bg-background/50 border-none focus-visible:ring-primary/20"
                                value={shippingAddress.email}
                                onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                                id="phone" 
                                placeholder="+880 1XXX XXXXXX" 
                                className="h-12 rounded-2xl bg-background/50 border-none focus-visible:ring-primary/20"
                                value={shippingAddress.phone}
                                onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zip">ZIP / Postcode</Label>
                            <Input 
                                id="zip" 
                                placeholder="1212" 
                                className="h-12 rounded-2xl bg-background/50 border-none focus-visible:ring-primary/20"
                                value={shippingAddress.zipCode}
                                onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input 
                            id="address" 
                            placeholder="House 12, Road 5, Block A" 
                            className="h-12 rounded-2xl bg-background/50 border-none focus-visible:ring-primary/20"
                            value={shippingAddress.address}
                            onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                            id="city" 
                            placeholder="Dhaka" 
                            className="h-12 rounded-2xl bg-background/50 border-none focus-visible:ring-primary/20"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                            required
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Payment Info Badge */}
            <div className="bg-primary/5 rounded-[24px] p-6 flex items-start gap-4 border border-primary/10">
                <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <CreditCard className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-sm mb-1">Secure Payment via Stripe</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        After clicking place order, you will be redirected to the secure Stripe gateway to complete your payment via Cards, Apple Pay, or Google Pay.
                    </p>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-6 sticky top-24">
            <Card className="rounded-[32px] border-none bg-card/50 backdrop-blur-md shadow-xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex flex-col gap-6">
                    <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted/30 shrink-0">
                                    <Image src={item.image} alt={item.title} width={48} height={48} className="object-cover h-full w-full" />
                                </div>
                                <div className="flex flex-col min-w-0 justify-center">
                                    <h5 className="text-xs font-bold truncate leading-tight">{item.title}</h5>
                                    <p className="text-[10px] text-muted-foreground font-medium">Qty: {item.quantity} • ${item.price}</p>
                                </div>
                                <div className="ml-auto flex items-center">
                                    <span className="text-xs font-black">${(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-border/20" />

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> Subtotal
                            </span>
                            <span className="font-bold">${totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium flex items-center gap-2">
                                <Truck className="w-4 h-4" /> Shipping
                            </span>
                            <span className="text-primary font-black">FREE</span>
                        </div>
                        <div className="mt-2 flex justify-between text-xl">
                            <span className="font-black tracking-tight">Total</span>
                            <span className="font-black text-primary">${totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-8">
                    <Button 
                        onClick={handleCheckout}
                        disabled={isCreatingOrder || isInitiatingPayment || !shippingAddress.name || !shippingAddress.address}
                        className="w-full h-14 rounded-2xl text-lg font-black"
                    >
                        {isCreatingOrder || isInitiatingPayment ? (
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        ) : (
                            <ShieldCheck className="w-6 h-6 mr-2" />
                        )}
                        Place Order & Pay
                    </Button>
                </CardFooter>
            </Card>

            <div className="px-4 text-center">
                <p className="text-[10px] text-muted-foreground font-medium">
                    100% Secure Checkout • Encrypted Transactions
                </p>
            </div>
        </div>
      </div>
    </div>
  )
}
