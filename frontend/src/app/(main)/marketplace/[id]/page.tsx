"use client"

import { useParams } from "next/navigation"
import { useProduct, useInitiatePayment, useCreateOrder, useCreateReview } from "@/hooks/use-marketplace"
import { useAuth } from "@/hooks/use-auth"
import { useSendMessage } from "@/hooks/use-messages"
import { useSocket } from "@/components/socket-provider"
import { useMessenger } from "@/components/messages/messenger-context"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShoppingCart, ArrowLeft, Star, Store, Truck, ShieldCheck, MessageSquare, User, Heart, Share2, Info, Check } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string }
   const { data: product, isLoading } = useProduct(id)
   const { mutate: initiatePayment, isPending: isPaying } = useInitiatePayment()
   const { mutate: createOrder, isPending: isOrdering } = useCreateOrder()
   const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage()
   const { mutate: createReview, isPending: isSubmittingReview } = useCreateReview()
   const { user: currentUser } = useAuth()
   const { socket } = useSocket()
   const { openChat } = useMessenger()

   const [message, setMessage] = useState("")
   const [reviewComment, setReviewComment] = useState("")
   const [reviewRating, setReviewRating] = useState(5)
   const [isOwnerOnline, setIsOwnerOnline] = useState(false)

   // Track store owner online status
   useEffect(() => {
     const ownerId = product?.store?.owner?.id
     if (!socket || !ownerId) return

     socket.emit("check-online", { userId: ownerId }, (res: { online: boolean }) => {
       setIsOwnerOnline(res.online)
     })

     const onStatusChanged = (data: { userId: string; status: string }) => {
        if (data.userId === ownerId) {
           setIsOwnerOnline(data.status === "online")
        }
     }

     socket.on("status-changed", onStatusChanged)
     return () => {
        socket.off("status-changed", onStatusChanged)
     }
   }, [socket, product?.store?.owner?.id])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto py-8 px-4 w-full">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return <div>Product not found</div>

   const handleBuyNow = () => {
     // 1. Create Order
     createOrder({
         storeId: product.store.id,
         items: [{ productId: product.id, quantity: 1 }],
         shippingAddress: { city: "Dhaka", address: "Sample Address" } // Mock
     }, {
         onSuccess: (order: any) => {
             // 2. Initiate Payment
             initiatePayment(order.id)
         }
     })
   }

   const handleMessageSeller = (e: any) => {
      if (e && e.preventDefault) e.preventDefault()
      
      if (!currentUser) {
         toast.error("Please login to message the seller", {
             action: {
                 label: "Login",
                 onClick: () => window.location.href = "/login"
             }
         })
         return
      }

      if (!message.trim()) {
         toast.error("Please enter a message")
         return
      }

      if (product.store?.owner) {
         const msg = message.trim()
         const owner = {
             id: product.store.owner.id,
             name: product.store.owner.name,
             image: product.store.owner.avatarUrl || product.store.owner.image
         }
         
         // 1. Instant interaction
         setMessage("")
         openChat(owner)
         
         // 2. Parallel send
         const toastId = toast.loading("Sending message...")
         sendMessage({ 
             receiverId: owner.id, 
             content: msg 
         }, {
             onSuccess: () => {
                 toast.success("Message sent!", { id: toastId })
             },
             onError: (err) => {
                 console.error("Failed to send message:", err)
                 toast.error("Failed to send message. Please try again.", { id: toastId })
             }
         })
      }
   }

   const handleSubmitReview = (e: any) => {
      if (e && e.preventDefault) e.preventDefault()

      if (!currentUser) {
         toast.error("Please login to submit a review")
         return
      }

      if (!reviewComment.trim()) {
         toast.error("Please enter a comment")
         return
      }

      createReview({
          productId: id,
          data: {
              rating: reviewRating,
              comment: reviewComment.trim()
          }
      }, {
          onSuccess: () => {
              setReviewComment("")
              setReviewRating(5)
          }
      })
   }

  return (
     <div className="flex h-full flex-col gap-6 max-w-7xl mx-auto py-8 px-4 w-full">
       <div className="flex items-center justify-between">
          <Link 
            href="/marketplace" 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold"
          >
            <ArrowLeft className="size-4" />
            Back to Marketplace
          </Link>
          <div className="flex gap-2">
             <Button variant="ghost" size="icon" className="rounded-full"><Heart className="size-4" /></Button>
             <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="size-4" /></Button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="flex flex-col gap-6">
           <div className="relative aspect-square rounded-4xl overflow-hidden border border-border/10 shadow-2xl">
              {product.images?.[0] ? (
                 <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
              ) : (
                 <div className="size-full bg-muted flex items-center justify-center text-muted-foreground">No Image</div>
              )}
           </div>
           <div className="grid grid-cols-4 gap-4">
             {product.images?.slice(1).map((img: string, i: number) => (
                 <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border/20 hover:border-primary transition-all cursor-pointer shadow-sm">
                    <Image src={img} alt="" fill className="object-cover" />
                 </div>
             ))}
           </div>

           {/* Messaging Card - Premium Design */}
           <Card className="rounded-4xl border-border/30 bg-card/40 backdrop-blur-md shadow-xl overflow-hidden mt-2">
              <CardContent className="p-8 flex flex-col gap-6">
                 <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                       <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/10 shadow-inner">
                          <MessageSquare className="size-6" />
                       </div>
                       {isOwnerOnline && (
                          <span className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-background rounded-full shadow-sm animate-pulse" />
                       )}
                    </div>
                    <div className="flex flex-col min-w-0">
                       <h4 className="font-black text-lg flex items-center gap-2">
                          Message Seller
                          {isOwnerOnline && (
                             <Badge variant="outline" className="h-5 text-[10px] font-black uppercase text-emerald-500 border-emerald-500/20 bg-emerald-500/5 px-2">Active</Badge>
                          )}
                       </h4>
                       <p className="text-sm text-muted-foreground font-semibold truncate leading-none mt-1">Chat directly with {product.store.name}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Textarea 
                       placeholder={`Hi ${product.store.name}, I'm interested in this product!`}
                       className="rounded-2xl bg-muted/30 border-none min-h-[110px] focus-visible:ring-primary/20 p-5 text-sm resize-none shadow-sm transition-all focus:bg-muted/50"
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button 
                       className="w-full h-14 rounded-2xl font-black text-base transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                       onClick={handleMessageSeller}
                       disabled={isSendingMessage}
                    >
                       {isSendingMessage ? "Sending..." : <><MessageSquare className="size-5" /> Send Instant Inquiry</>}
                    </Button>
                 </div>
              </CardContent>
           </Card>
         </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 rounded-full">{product.category.name}</Badge>
                <div className="flex items-center text-sm text-yellow-500 ml-auto font-medium">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    4.8 (124 reviews)
                </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">{product.title}</h1>
            <p className="text-3xl font-bold text-primary">${product.price}</p>
          </div>

           <Tabs defaultValue="description" className="w-full">
              <TabsList className="bg-muted/40 p-1.5 rounded-[1.25rem] h-auto w-full grid grid-cols-2 mb-8 border border-border/10 backdrop-blur-sm shadow-inner">
                 <TabsTrigger value="description" className="rounded-xl py-3 font-black text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-4xl active:scale-95">Product Details</TabsTrigger>
                 <TabsTrigger value="reviews" className="rounded-xl py-3 font-black text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-4xl active:scale-95">Customer Reviews ({product.reviews?.length || 0})</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-0 focus-visible:outline-none">
                 <Card className="rounded-3xl border-border/20 bg-card/10 shadow-sm overflow-hidden">
                    <CardContent className="p-8">
                       <h3 className="text-xl font-black mb-4 flex items-center gap-3"><Info className="size-5 text-primary" /> Overview</h3>
                       <p className="text-muted-foreground leading-relaxed text-base font-medium whitespace-pre-wrap">
                          {product.description}
                       </p>
                       <Separator className="my-8 bg-border/40" />
                       <div className="grid grid-cols-2 gap-8 font-black text-sm">
                          <div className="flex items-center gap-3"><Check className="size-5 text-emerald-500" /> Premium Quality</div>
                          <div className="flex items-center gap-3"><Check className="size-5 text-emerald-500" /> EchoNet Verified</div>
                          <div className="flex items-center gap-3"><Check className="size-5 text-emerald-500" /> Fast Shipping</div>
                          <div className="flex items-center gap-3"><Check className="size-5 text-emerald-500" /> Best Price Guarantee</div>
                       </div>
                    </CardContent>
                 </Card>
              </TabsContent>
              <TabsContent value="reviews" className="mt-0 space-y-6 focus-visible:outline-none">
                 {/* Post Review Form */}
                 <Card className="rounded-3xl border-border/30 bg-primary/5 shadow-inner">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-lg font-black tracking-tight">Post Your Feedback</CardTitle>
                       <CardDescription className="text-xs font-bold font-muted-foreground">Share your experience with others</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-4">
                        <div className="flex items-center gap-3 bg-background/50 p-3 rounded-2xl w-fit border border-border/10 shadow-sm">
                           <span className="text-xs font-black uppercase text-muted-foreground mr-1">Rating:</span>
                           {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                 key={star} 
                                 type="button"
                                 onClick={() => setReviewRating(star)}
                                 className="transition-transform active:scale-125 focus:outline-none"
                              >
                                 <Star className={cn("size-5", star <= reviewRating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30")} />
                              </button>
                           ))}
                        </div>
                        <div className="relative">
                            <Textarea 
                               placeholder="What do you think about this product?"
                               className="rounded-2xl border-none bg-background/80 min-h-[100px] p-4 text-sm font-medium focus-visible:ring-primary/20 shadow-sm transition-all"
                               value={reviewComment}
                               onChange={(e) => setReviewComment(e.target.value)}
                            />
                            <Button 
                               onClick={handleSubmitReview}
                               disabled={isSubmittingReview}
                               className="absolute bottom-3 right-3 rounded-xl h-10 px-5 font-black text-xs shadow-lg shadow-primary/10 transition-all active:scale-95"
                            >
                               {isSubmittingReview ? "Posting..." : "Post Review"}
                            </Button>
                        </div>
                    </CardContent>
                 </Card>

                 {/* Reviews List */}
                 <div className="flex flex-col gap-4">
                    {product.reviews && product.reviews.length > 0 ? (
                       product.reviews.map((review: any) => (
                          <Card key={review.id} className="rounded-2xl border-border/20 shadow-sm hover:shadow-md transition-all group">
                             <CardContent className="p-5 flex gap-4">
                                <Avatar className="size-12 rounded-xl ring-2 ring-primary/5 group-hover:ring-primary/15 transition-all">
                                   <AvatarImage src={review.user.avatarUrl || review.user.image} />
                                   <AvatarFallback className="rounded-xl font-black bg-primary/5 text-primary">{review.user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                   <div className="flex items-center justify-between">
                                      <h5 className="font-black text-sm">{review.user.name}</h5>
                                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">{new Date(review.createdAt).toLocaleDateString()}</span>
                                   </div>
                                   <div className="flex items-center gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                         <Star key={i} className={cn("size-3", i < review.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/20")} />
                                      ))}
                                   </div>
                                   <p className="text-sm text-muted-foreground font-semibold leading-relaxed">{review.comment}</p>
                                </div>
                             </CardContent>
                          </Card>
                       ))
                    ) : (
                       <div className="py-20 text-center bg-muted/20 border-2 border-dashed border-border/20 rounded-[2.5rem]">
                          <MessageSquare className="size-12 mx-auto mb-4 text-muted-foreground/20" />
                          <p className="font-black text-muted-foreground opacity-50">No reviews yet. Be the first!</p>
                       </div>
                    )}
                 </div>
              </TabsContent>
           </Tabs>

           <Card className="bg-card/40 border-border/20 backdrop-blur-sm rounded-4xl overflow-hidden shadow-2xl mt-auto">
             <CardContent className="p-8 flex flex-col gap-6">
                 <div className="flex items-center gap-5">
                     <div className="shrink-0">
                        <div className="size-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10 shadow-sm">
                            <Store className="size-8" />
                        </div>
                     </div>
                     <div className="flex flex-col min-w-0">
                         <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1.5 opacity-60">Verified Global Store</p>
                         <h4 className="font-black text-2xl tracking-tighter truncate leading-none">{product.store.name}</h4>
                     </div>
                     <Link 
                        href={`/store/${product.store.id}`}
                        className={cn(
                           buttonVariants({ variant: "outline", size: "sm" }),
                           "ml-auto rounded-xl hover:bg-primary hover:text-white transition-all h-11 px-6 text-sm font-black border-border/40 hover:scale-105 active:scale-95 shadow-lg shadow-primary/5"
                        )}
                     >
                        Visit Store
                     </Link>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/5 shadow-inner">
                        <div className="flex items-center gap-4">
                            <div className="size-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                                <Truck className="size-5" />
                            </div>
                            <span className="text-sm font-black text-muted-foreground tracking-tight">Available Inventory</span>
                        </div>
                        <span className="font-black text-base">{product.stock} Units left</span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/5 shadow-inner">
                        <div className="flex items-center gap-4">
                            <div className="size-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                <ShieldCheck className="size-5" />
                            </div>
                            <span className="text-sm font-black text-muted-foreground tracking-tight">Purchase Guarantee</span>
                        </div>
                        <span className="font-black text-base text-blue-600">EchoNet Secure</span>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 pt-2">
                   <Button 
                       size="lg" 
                       className="flex-1 rounded-2xl h-16 text-xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 tracking-tight"
                       onClick={handleBuyNow}
                       disabled={isPaying || isOrdering || product.stock === 0}
                   >
                      {isPaying || isOrdering ? "Processing..." : <><ShoppingCart className="size-6 mr-3" /> Purchase Now</>}
                   </Button>
                   <Button 
                       size="lg" 
                       variant="outline" 
                       className="rounded-2xl size-16 px-0 border-border/40 hover:bg-muted/20 transition-all active:scale-95 shadow-xl"
                       disabled={product.stock === 0}
                   >
                      <Share2 className="size-6" />
                   </Button>
                 </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
