"use client"

import { useProperty, useCreateBooking, useSendEnquiry, useProperties } from "@/hooks/use-property"
import { useSendMessage } from "@/hooks/use-messages"
import { PropertyCard } from "@/components/property/property-card"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { 
  Bed, Bath, Move, MapPin, Check, 
  Calendar, MessageSquare, Phone, 
  ShieldCheck, Share2, Heart,
  Building
} from "lucide-react"
import { UserImage } from "@/components/user-image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useMessenger } from "@/components/messages/messenger-context"
import { useSocket } from "@/components/socket-provider"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { toast } from "sonner"
import { useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from "@/components/ui/table"

export default function PropertyDetailPage() {
  const { id } = useParams()
  const { data: property, isLoading } = useProperty(id as string)
  const { mutate: sendEnquiry } = useSendEnquiry()
  const { mutate: createBooking } = useCreateBooking()
  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage()
  const { data: recentProperties } = useProperties({ limit: 4 })
  const { openChat } = useMessenger()
  const { socket } = useSocket()
  const { user: currentUser } = useAuth()
  
  const [enquiryMsg, setEnquiryMsg] = useState("")
  const [isOwnerOnline, setIsOwnerOnline] = useState(false)

  // Track owner online status
  useEffect(() => {
    if (!socket || !property?.owner?.id) return

    // Initial check
    socket.emit("check-online", { userId: property.owner.id }, (res: { online: boolean }) => {
      setIsOwnerOnline(res.online)
    })

    // Listen for status changes
    const onStatusChanged = (data: { userId: string; status: string }) => {
       if (data.userId === property.owner?.id) {
          setIsOwnerOnline(data.status === "online")
       }
    }

    socket.on("status-changed", onStatusChanged)
    return () => {
       socket.off("status-changed", onStatusChanged)
    }
  }, [socket, property?.owner?.id])

  if (isLoading) return <div className="p-8">Loading...</div>
  if (!property) return <div className="p-8">Property not found</div>

  const handleEnquiry = (e: any) => {
     console.log("SEND BUTTON CLICKED - Interaction starting");
     if (e && e.preventDefault) e.preventDefault()

     if (!currentUser) {
        toast.error("Please login to send an enquiry", {
            action: {
                label: "Login",
                onClick: () => window.location.href = "/login"
            }
        })
        return
     }

     if (!enquiryMsg.trim()) {
        toast.error("Please enter a message")
        return
     }
     if (property.owner) {
        const msg = enquiryMsg.trim()
        const owner = {
            id: property.owner.id,
            name: property.owner.name,
            image: property.owner.avatarUrl || property.owner.image
        }
        
        // 1. Clear input immediately
        setEnquiryMsg("")
        
        // 2. Open chat IMMEDIATELY for "auto" feel
        openChat(owner)
        
        // 3. Send message in parallel
        const toastId = toast.loading("Sending enquiry...")
        sendMessage({ 
            receiverId: owner.id, 
            content: msg 
        }, {
            onSuccess: () => {
                toast.success("Enquiry sent!", { id: toastId })
            },
            onError: () => {
                toast.error("Failed to send enquiry.", { id: toastId })
                // Restore text if it failed? No, usually safer to just let user know
            }
        })
     }
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-20 px-4">
      {/* Hero Section: Gallery and Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-sm border border-border/50">
               <Image
                 src={property.images?.[0]?.url || "/placeholder-property.jpg"}
                 alt={property.title}
                 fill
                 className="object-cover"
               />
               <div className="absolute top-6 left-6 flex gap-3">
                  <Badge className="bg-primary hover:bg-primary px-3 py-1 rounded-md font-semibold text-xs shadow-sm">
                     {property.listingType}
                  </Badge>
                  <Badge variant="secondary" className="bg-background/95 border border-border/50 px-3 py-1 rounded-md font-semibold text-xs shadow-sm">
                     {property.category}
                  </Badge>
               </div>
               <div className="absolute bottom-6 right-6 flex gap-3">
                  <Button variant="secondary" size="icon" className="rounded-full bg-background/95 border border-border/50 hover:bg-background transition-colors shadow-sm">
                     <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="rounded-full bg-background/95 border border-border/50 hover:bg-background transition-colors shadow-sm">
                     <Share2 className="h-4 w-4" />
                  </Button>
               </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <p className="flex items-center text-muted-foreground text-sm font-medium">
                     <MapPin className="h-4 w-4 mr-1.5 text-primary" /> {property.address}, {property.area}, {property.city}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-3xl font-bold text-primary">৳{Number(property.price).toLocaleString()}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                     {property.priceUnit === 'TOTAL' ? 'Full Price' : 'Per Month / Rent'}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border/50">
               <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card">
                  <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                     <Bed className="h-4 w-4" />
                  </div>
                  <div>
                     <p className="text-base font-bold leading-none">{property.details?.bedrooms || 0}</p>
                     <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-1">Bedrooms</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card">
                  <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                     <Bath className="h-4 w-4" />
                  </div>
                  <div>
                     <p className="text-base font-bold leading-none">{property.details?.bathrooms || 0}</p>
                     <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-1">Bathrooms</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card">
                  <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                     <Move className="h-4 w-4" />
                  </div>
                  <div>
                     <p className="text-base font-bold leading-none">{property.details?.areaSqft || 0}</p>
                     <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-1">Sqft Area</p>
                  </div>
               </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card">
                  <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                     <Building className="h-4 w-4" />
                  </div>
                  <div>
                     <p className="text-base font-bold leading-none">{property.details?.floorNo || 0}</p>
                     <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-1">Floor Level</p>
                  </div>
               </div>
            </div>

            <Tabs defaultValue="description" className="w-full">
               <TabsList className="bg-muted/50 p-1 rounded-lg mb-6 sticky top-20 z-10 backdrop-blur-sm">
                  <TabsTrigger value="description" className="rounded-md px-6 font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Description</TabsTrigger>
                  <TabsTrigger value="amenities" className="rounded-md px-6 font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Amenities</TabsTrigger>
                  <TabsTrigger value="location" className="rounded-md px-6 font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Location</TabsTrigger>
               </TabsList>
               <TabsContent value="description" className="text-muted-foreground leading-relaxed text-lg">
                  {property.description}
               </TabsContent>
               <TabsContent value="amenities">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-semibold text-sm">
                     {property.amenities?.map((amenity: any) => (
                        <div key={amenity.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                           <Check className="h-3.5 w-3.5 text-emerald-500" />
                           {amenity.name}
                        </div>
                     ))}
                  </div>
               </TabsContent>
               <TabsContent value="location">
                   <div className="h-96 w-full rounded-2xl bg-muted/30 flex items-center justify-center border border-dashed border-border/50">
                      <div className="text-center">
                         <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                         <p className="font-bold text-muted-foreground">Map Integration Pending</p>
                         <p className="text-sm text-muted-foreground/60">{property.address}, {property.city}</p>
                      </div>
                   </div>
               </TabsContent>
            </Tabs>
         </div>

         {/* Sidebar: Contact & Actions */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl border border-border/50 shadow-sm bg-card overflow-hidden sticky top-24 p-0">
               <CardContent className="p-6">
                  <Link href={`/profile/${property.owner?.id}`} className="flex items-center gap-4 mb-6 group">
                     <div className="relative">
                        <UserImage 
                            user={{ name: property.owner?.name, avatarUrl: property.owner?.avatarUrl || property.owner?.image }} 
                            className="h-14 w-14 group-hover:ring-2 ring-primary transition-all overflow-hidden"
                        />
                        {isOwnerOnline && (
                           <span className="absolute bottom-1 right-0 h-3 w-3 bg-emerald-500 border-2 border-background rounded-full shadow-sm animate-pulse" />
                        )}
                     </div>
                     <div className="flex flex-col">
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors flex items-center gap-2 text-ellipsis overflow-hidden whitespace-nowrap">
                           {property.owner?.name}
                           {isOwnerOnline && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 uppercase tracking-tighter border border-emerald-500/20">
                                 Active
                              </span>
                           )}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                           <ShieldCheck className="h-3.5 w-3.5" /> Verified Agent
                        </div>
                     </div>
                  </Link>

                   <form onSubmit={handleEnquiry} className="space-y-4">
                     <Textarea 
                       placeholder="Message agent..." 
                       className="rounded-xl bg-muted/30 border-none min-h-[100px] focus-visible:ring-primary/20 p-4 text-sm"
                       value={enquiryMsg}
                       onChange={(e) => setEnquiryMsg(e.target.value)}
                     />
                     <Button 
                        type="submit"
                        onClick={handleEnquiry}
                        disabled={isSendingMessage}
                        className="w-full h-11 rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                    >
                        {isSendingMessage ? "Processing..." : (
                            <><MessageSquare className="mr-2 h-4 w-4" /> Send Enquiry</>
                        )}
                     </Button>
                  </form>

                   <div className="grid grid-cols-2 gap-3 mt-4">
                     <Button 
                        variant="outline" 
                        className="h-11 rounded-xl font-bold border-border hover:bg-muted shadow-sm"
                        onClick={() => {
                          if (property.owner?.phoneNumber) {
                            window.location.href = `tel:${property.owner.phoneNumber}`;
                          } else {
                            toast.info("Phone number not provided");
                          }
                        }}
                     >
                        <Phone className="mr-2 h-4 w-4" /> Call
                     </Button>
                     <Button 
                        variant="outline" 
                        className="h-11 rounded-xl font-bold border-border hover:bg-muted shadow-sm"
                        onClick={() => toast.success("Visit request sent to owner!")}
                     >
                        <Calendar className="mr-2 h-4 w-4" /> Visit
                     </Button>
                  </div>

                  {/* Quick Summary Table */}
                  <div className="mt-6 pt-6 border-t border-border/50">
                     <h5 className="text-sm font-bold mb-3">Quick Summary</h5>
                     <div className="rounded-xl border border-border/40 overflow-hidden">
                        <Table>
                           <TableBody>
                              <TableRow className="hover:bg-transparent border-border/40">
                                 <TableCell className="font-semibold text-muted-foreground text-xs py-2">Property ID</TableCell>
                                 <TableCell className="text-right font-bold text-xs py-2">#{property.id.slice(0, 8).toUpperCase()}</TableCell>
                              </TableRow>
                              <TableRow className="hover:bg-transparent border-border/40">
                                 <TableCell className="font-semibold text-muted-foreground text-xs py-2">Listing Type</TableCell>
                                 <TableCell className="text-right font-bold text-xs py-2">{property.listingType}</TableCell>
                              </TableRow>
                              <TableRow className="hover:bg-transparent border-border/40">
                                 <TableCell className="font-semibold text-muted-foreground text-xs py-2">Category</TableCell>
                                 <TableCell className="text-right font-bold text-xs py-2">{property.category}</TableCell>
                              </TableRow>
                              <TableRow className="hover:bg-transparent border-none">
                                 <TableCell className="font-semibold text-muted-foreground text-xs py-2">Status</TableCell>
                                 <TableCell className="text-right py-2">
                                    <Badge variant="outline" className="text-[10px] font-black uppercase px-2 py-0 h-5 border-primary/30 text-primary">
                                       {property.status}
                                    </Badge>
                                 </TableCell>
                              </TableRow>
                           </TableBody>
                        </Table>
                     </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border/50 text-center">
                     <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Member Since</p>
                     <p className="font-bold text-sm">{new Date(property.owner?.createdAt).getFullYear()}</p>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
      
      {/* Recently Listed Properties */}
      {recentProperties?.data && (
        <div className="space-y-8 pt-10 border-t border-border/50">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Recently Listed</h2>
                    <p className="text-muted-foreground font-medium">Find your next dream home among our newest listings</p>
                </div>
                  <Link 
                    href="/properties" 
                    className={cn(
                      buttonVariants({ variant: "ghost" }), 
                      "font-bold text-primary hover:text-primary hover:bg-primary/5 rounded-full"
                    )}
                  >
                    View All Properties
                  </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentProperties.data
                    .filter((p: any) => p.id !== id)
                    .slice(0, 3)
                    .map((p: any) => (
                        <PropertyCard key={p.id} property={p} />
                    ))
                }
            </div>
        </div>
      )}
    </div>
  )
}
