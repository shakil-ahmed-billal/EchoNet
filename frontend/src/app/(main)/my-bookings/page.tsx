"use client"

import { useMyBookings } from "@/hooks/use-property"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, User, Home, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function MyBookingsPage() {
  const { data: bookings, isLoading } = useMyBookings()

  if (isLoading) return <div className="p-8">Loading bookings...</div>

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-4xl font-black">My Schedule</h1>
        <p className="text-muted-foreground font-medium">Manage your property visits and viewing appointments.</p>
      </div>

      <Tabs defaultValue="asVisitor" className="w-full">
         <TabsList className="bg-muted/30 p-1.5 rounded-2xl mb-8 flex w-fit">
            <TabsTrigger value="asVisitor" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-background data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all">
               My Visits <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-none">{bookings?.asVisitor?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="asOwner" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-background data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all ml-2">
               Visits to My Properties <Badge variant="secondary" className="ml-2 bg-emerald-500/10 text-emerald-500 border-none">{bookings?.asOwner?.length || 0}</Badge>
            </TabsTrigger>
         </TabsList>

         <TabsContent value="asVisitor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {bookings?.asVisitor?.map((booking: any) => (
                  <Card key={booking.id} className="rounded-[32px] border-none shadow-sm hover:shadow-xl transition-all bg-card/50 backdrop-blur-sm group overflow-hidden border border-border/40">
                     <CardContent className="p-0 flex flex-col sm:flex-row">
                        <div className="w-full sm:w-1/3 relative h-48 sm:h-auto">
                           {booking.property.images?.[0] && (
                              <Image src={booking.property.images[0].url} alt="" fill className="object-cover" />
                           )}
                           <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent" />
                        </div>
                        <div className="p-6 flex-1 space-y-4">
                           <div className="flex justify-between items-start">
                              <div>
                                 <h3 className="font-black text-lg leading-tight tracking-tight">{booking.property.title}</h3>
                                 <p className="text-xs font-bold text-muted-foreground flex items-center mt-1">
                                    <MapPin className="h-3 w-3 mr-1" /> {booking.property.address}
                                 </p>
                              </div>
                              <Badge className={`font-black text-[10px] px-3 py-1 rounded-full ${
                                 booking.status === 'CONFIRMED' ? 'bg-emerald-500' : 
                                 booking.status === 'PENDING' ? 'bg-orange-500' : 'bg-muted text-muted-foreground'
                              }`}>
                                 {booking.status}
                              </Badge>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Date</p>
                                 <p className="font-black text-sm">{new Date(booking.visitDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> Time</p>
                                 <p className="font-black text-sm">{booking.visitTime}</p>
                              </div>
                           </div>

                           <div className="pt-4 border-t border-border/40 flex justify-end gap-2">
                              {booking.status === 'PENDING' && (
                                <Button variant="ghost" className="rounded-xl h-10 px-4 font-black text-xs text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100">
                                   <XCircle className="mr-2 h-4 w-4" /> Cancel Visit
                                </Button>
                              )}
                              <Link href={`/properties/${booking.property.id}`}>
                                 <Button variant="outline" className="rounded-xl h-10 px-4 font-black text-xs border-2">
                                    View Property
                                 </Button>
                              </Link>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         </TabsContent>

         <TabsContent value="asOwner" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {bookings?.asOwner?.map((booking: any) => (
                  <Card key={booking.id} className="rounded-[40px] border-none shadow-2xl bg-card overflow-hidden transition-transform hover:scale-[1.02]">
                     <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="h-14 w-14 rounded-full bg-muted overflow-hidden relative border-2 border-primary/20">
                              {booking.user?.avatarUrl && <Image src={booking.user.avatarUrl} alt="" fill className="object-cover" />}
                           </div>
                           <div className="flex-1">
                              <h4 className="font-black text-lg leading-none">{booking.user?.name}</h4>
                              <p className="text-[10px] font-bold text-muted-foreground mt-1.5 break-all opacity-60">{booking.user?.email}</p>
                           </div>
                        </div>

                        <div className="space-y-4 mb-8">
                           <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                              <p className="text-[10px] font-black text-muted-foreground mb-1 leading-none">Interested Property</p>
                              <p className="font-black text-sm text-primary line-clamp-1 italic">"{booking.property.title}"</p>
                           </div>
                           <div className="flex gap-4">
                              <div className="flex-1 space-y-1">
                                 <p className="text-[10px] font-black text-muted-foreground">Date</p>
                                 <p className="font-black text-sm">{new Date(booking.visitDate).toLocaleDateString()}</p>
                              </div>
                              <div className="flex-1 space-y-1">
                                 <p className="text-[10px] font-black text-muted-foreground">Time</p>
                                 <p className="font-black text-sm">{booking.visitTime}</p>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-3">
                           {booking.status === 'PENDING' ? (
                              <>
                                 <Button className="flex-1 h-12 rounded-2xl font-black bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
                                 </Button>
                                 <Button variant="outline" className="flex-1 h-12 rounded-2xl font-black border-2 border-red-100 text-red-500 hover:bg-red-50">
                                    Decline
                                 </Button>
                              </>
                           ) : (
                              <Button variant="secondary" className="w-full h-12 rounded-2xl font-black bg-primary/5 text-primary border border-primary/10" disabled>
                                 Status: {booking.status}
                              </Button>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         </TabsContent>
      </Tabs>
    </div>
  )
}
