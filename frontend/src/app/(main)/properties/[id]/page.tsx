"use client"

import { useProperty, useCreateBooking, useSendEnquiry } from "@/hooks/use-property"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Bed, Bath, Move, MapPin, Check, 
  Calendar, MessageSquare, Phone, 
  ShieldCheck, Share2, Heart,
  Building, User
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function PropertyDetailPage() {
  const { id } = useParams()
  const { data: property, isLoading } = useProperty(id as string)
  const { mutate: sendEnquiry } = useSendEnquiry()
  const { mutate: createBooking } = useCreateBooking()
  
  const [enquiryMsg, setEnquiryMsg] = useState("")

  if (isLoading) return <div className="p-8">Loading...</div>
  if (!property) return <div className="p-8">Property not found</div>

  const handleEnquiry = (e: React.FormEvent) => {
     e.preventDefault()
     sendEnquiry({ propertyId: id, message: enquiryMsg })
     setEnquiryMsg("")
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Hero Section: Gallery and Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border border-border/40">
               <Image
                 src={property.images?.[0]?.url || "/placeholder-property.jpg"}
                 alt={property.title}
                 fill
                 className="object-cover"
               />
               <div className="absolute top-6 left-6 flex gap-3">
                  <Badge className="bg-primary hover:bg-primary px-4 py-1.5 rounded-full font-black text-xs shadow-lg">
                     {property.listingType}
                  </Badge>
                  <Badge variant="secondary" className="bg-background/90 backdrop-blur-md px-4 py-1.5 rounded-full font-black text-xs shadow-lg">
                     {property.category}
                  </Badge>
               </div>
               <div className="absolute bottom-6 right-6 flex gap-3">
                  <Button variant="secondary" size="icon" className="rounded-full bg-background/90 backdrop-blur-md hover:scale-110 transition-transform">
                     <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="secondary" size="icon" className="rounded-full bg-background/90 backdrop-blur-md hover:scale-110 transition-transform">
                     <Share2 className="h-5 w-5" />
                  </Button>
               </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h1 className="text-4xl font-black tracking-tighter mb-2">{property.title}</h1>
                  <p className="flex items-center text-muted-foreground font-medium">
                     <MapPin className="h-4 w-4 mr-1.5 text-primary" /> {property.address}, {property.area}, {property.city}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-4xl font-black text-primary">৳{Number(property.price).toLocaleString()}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                     {property.priceUnit === 'TOTAL' ? 'Full Price' : 'Per Month / Rent'}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-border/40">
               <div className="flex items-center gap-4 p-4 rounded-3xl bg-muted/20">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <Bed className="h-5 w-5" />
                  </div>
                  <div>
                     <p className="text-lg font-black leading-none">{property.details?.bedrooms || 0}</p>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Bedrooms</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 rounded-3xl bg-muted/20">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <Bath className="h-5 w-5" />
                  </div>
                  <div>
                     <p className="text-lg font-black leading-none">{property.details?.bathrooms || 0}</p>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Bathrooms</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 rounded-3xl bg-muted/20">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <Move className="h-5 w-5" />
                  </div>
                  <div>
                     <p className="text-lg font-black leading-none">{property.details?.areaSqft || 0}</p>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Sqft Area</p>
                  </div>
               </div>
                <div className="flex items-center gap-4 p-4 rounded-3xl bg-muted/20">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <Building className="h-5 w-5" />
                  </div>
                  <div>
                     <p className="text-lg font-black leading-none">{property.details?.floorNo || 0}</p>
                     <p className="text-[10px] font-bold text-muted-foreground mt-1">Floor Level</p>
                  </div>
               </div>
            </div>

            <Tabs defaultValue="description" className="w-full">
               <TabsList className="bg-muted/30 p-1.5 rounded-2xl mb-6">
                  <TabsTrigger value="description" className="rounded-xl px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Description</TabsTrigger>
                  <TabsTrigger value="amenities" className="rounded-xl px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Amenities</TabsTrigger>
                  <TabsTrigger value="location" className="rounded-xl px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Location</TabsTrigger>
               </TabsList>
               <TabsContent value="description" className="text-muted-foreground leading-relaxed text-lg">
                  {property.description}
               </TabsContent>
               <TabsContent value="amenities">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-bold text-sm">
                     {property.amenities?.map((amenity: any) => (
                        <div key={amenity.id} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/40">
                           <Check className="h-4 w-4 text-emerald-500" />
                           {amenity.name}
                        </div>
                     ))}
                  </div>
               </TabsContent>
               <TabsContent value="location">
                   <div className="h-96 w-full rounded-3xl bg-muted/20 flex items-center justify-center border border-dashed border-border/60">
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
         <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[40px] border-none shadow-2xl bg-card overflow-hidden sticky top-32">
               <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl overflow-hidden relative">
                        {property.owner?.avatarUrl ? (
                           <Image src={property.owner.avatarUrl} alt={property.owner.name} fill className="object-cover" />
                        ) : <User className="h-8 w-8" />}
                     </div>
                     <div className="flex flex-col">
                        <h4 className="font-black text-xl">{property.owner?.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mt-1">
                           <ShieldCheck className="h-3.5 w-3.5" /> Verified Agent
                        </div>
                     </div>
                  </div>

                  <form onSubmit={handleEnquiry} className="space-y-4">
                     <Textarea 
                       placeholder="I'm interested in this property. Is it still available?" 
                       className="rounded-2xl bg-muted/30 border-none min-h-[120px] focus-visible:ring-primary/20 p-4"
                       value={enquiryMsg}
                       onChange={(e) => setEnquiryMsg(e.target.value)}
                     />
                     <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95">
                        <MessageSquare className="mr-2 h-5 w-5" /> Send Enquiry
                     </Button>
                  </form>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                     <Button variant="outline" className="h-14 rounded-2xl font-black border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all">
                        <Phone className="mr-2 h-5 w-5" /> Call Agent
                     </Button>
                     <Button variant="outline" className="h-14 rounded-2xl font-black border-2 transition-all">
                        <Calendar className="mr-2 h-5 w-5" /> Schedule visit
                     </Button>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-border/40 text-center">
                     <p className="text-xs font-bold text-muted-foreground mb-2">Member Since</p>
                     <p className="font-black">{new Date(property.owner?.createdAt).getFullYear()}</p>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}
