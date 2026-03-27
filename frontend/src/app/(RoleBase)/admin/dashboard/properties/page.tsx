"use client"

import { useProperties, useApproveProperty, useRejectProperty } from "@/hooks/use-property"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Home, MapPin, Check, X, Building, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function AdminPropertiesPage() {
  const { data: properties, isLoading } = useProperties({ status: 'PENDING' })
  const { mutate: approve, isPending: isApproving } = useApproveProperty()
  const { mutate: reject, isPending: isRejecting } = useRejectProperty()

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Listing Moderation</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Review new real estate listings for quality and safety compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Search property..." className="pl-9 rounded-2xl bg-card border-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
           <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
        </div>
      ) : properties?.data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
          {properties.data.map((property: any) => (
            <Card key={property.id} className="rounded-[40px] border-none shadow-sm overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full bg-card/50 backdrop-blur-sm border border-border/40">
              <div className="h-56 w-full bg-muted/40 relative">
                 {property.images?.[0] && (
                    <Image src={property.images[0].url} alt="" fill className="object-cover transition-transform group-hover:scale-105" />
                 )}
                 <div className="absolute top-4 left-4">
                    <Badge className="bg-background/90 backdrop-blur-md text-foreground px-4 py-1.5 rounded-full text-xs font-black shadow-lg uppercase border-none">
                       ৳{Number(property.price).toLocaleString()}
                    </Badge>
                 </div>
                 <div className="absolute top-4 right-4">
                    <Badge className="bg-orange-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border-none shadow-lg shadow-orange-500/20">
                       Pending
                    </Badge>
                 </div>
              </div>
              <CardContent className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-xl leading-tight group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <p className="flex items-center text-xs text-muted-foreground mt-3 font-bold uppercase tracking-widest leading-none">
                    <MapPin className="w-4 h-4 mr-1.5 text-primary" /> {property.area}, {property.city}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-border/20 text-center">
                     <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/20">
                        <span className="text-foreground text-sm font-black">{property.details?.bedrooms || 0}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Beds</span>
                     </div>
                     <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/20">
                        <span className="text-foreground text-sm font-black">{property.details?.bathrooms || 0}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Baths</span>
                     </div>
                     <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/20">
                        <span className="text-foreground text-sm font-black">{property.details?.areaSqft || 0}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Sqft</span>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-10">
                   <Button 
                      disabled={isApproving}
                      onClick={() => approve(property.id)}
                      className="flex-1 rounded-2xl shadow-xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 font-black h-14 transition-all hover:scale-[1.05] active:scale-95"
                   >
                      <Check className="mr-2 w-5 h-5" /> Approve
                   </Button>
                   <Button 
                      disabled={isRejecting}
                      onClick={() => reject(property.id)}
                      variant="outline" 
                      className="flex-1 rounded-2xl font-black h-14 border-2 border-red-100 text-red-500 hover:bg-red-50 transition-all"
                   >
                      <X className="mr-2 w-5 h-5" /> Reject
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-muted/5 rounded-[40px] border border-dashed border-border/60">
           <Check className="h-16 w-16 text-emerald-500 mb-6 opacity-20" />
           <h3 className="text-2xl font-black mb-2">Queue is Empty</h3>
           <p className="text-muted-foreground font-medium">All properties have been reviewed. Excellent work!</p>
        </div>
      )}
    </div>
  )
}
