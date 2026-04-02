"use client"

import { useCart } from "@/hooks/use-cart"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function CartSheet() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-10 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground relative">
          <ShoppingBag className="size-5" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-background">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md border-l border-border/20 bg-card/95 backdrop-blur-xl p-0">
        <SheetHeader className="p-6 border-b border-border/10">
          <SheetTitle className="flex items-center gap-2 text-2xl font-black">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-8 max-w-[250px]">
              Looks like you haven't added anything to your cart yet.
            </p>
            <SheetTrigger asChild>
              <Button className="rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
                Continue Shopping
              </Button>
            </SheetTrigger>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="flex flex-col gap-6">
                {items.map((item) => (
                  <div key={item.id} className="group flex gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="relative aspect-square h-20 w-20 rounded-2xl overflow-hidden bg-muted/30 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium tracking-wider truncate">
                          {item.storeName}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-muted/50 rounded-xl px-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="font-bold text-sm">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="p-6 bg-muted/30 border-t border-border/10 flex-col gap-4 sm:flex-col">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-bold">${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Shipping</span>
                  <span className="text-primary font-bold">Calculated at checkout</span>
                </div>
                <Separator className="bg-border/10" />
                <div className="flex justify-between text-lg">
                  <span className="font-black">Total</span>
                  <span className="font-black text-primary">${totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <Link href="/checkout" className="w-full">
                <SheetTrigger asChild>
                  <Button className="w-full h-14 rounded-2xl text-lg font-black mt-2">
                    Proceed to Checkout
                  </Button>
                </SheetTrigger>
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
