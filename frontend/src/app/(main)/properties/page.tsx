"use client"

import Link from "next/link"
import { useProperties } from "@/hooks/use-property"
import { PropertyCard } from "@/components/property/property-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, Map as MapIcon, Grid, List as ListIcon } from "lucide-react"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function PropertiesPage() {
  const [filters, setFilters] = useState({
    searchTerm: "",
    listingType: "",
    category: "",
  })

  const { data: properties, isLoading } = useProperties(filters)

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Search & Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-black">EchoNet Properties</h1>
        </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-full h-12 px-6 font-bold border-2">
                <MapIcon className="mr-2 h-4 w-4" /> Map View
             </Button>
             <Link href="/properties/new">
                <Button className="rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20">
                   List Your Property
                </Button>
             </Link>
          </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-3xl bg-card border border-border/40 shadow-sm">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by area, property type, or keywords..." 
              className="pl-12 h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
         </div>
         <div className="flex gap-3">
            <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold border-2">
               <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
            <div className="flex items-center bg-muted/30 p-1.5 rounded-2xl">
               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-background shadow-sm">
                  <Grid className="h-4 w-4" />
               </Button>
               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground">
                  <ListIcon className="h-4 w-4" />
               </Button>
            </div>
         </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="space-y-4">
               <Skeleton className="h-64 w-full rounded-3xl" />
               <Skeleton className="h-8 w-3/4 rounded-xl" />
               <Skeleton className="h-6 w-1/2 rounded-xl" />
               <div className="grid grid-cols-3 gap-3">
                 <Skeleton className="h-12 rounded-2xl" />
                 <Skeleton className="h-12 rounded-2xl" />
                 <Skeleton className="h-12 rounded-2xl" />
               </div>
             </div>
           ))}
        </div>
      ) : properties?.data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.data.map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/10 rounded-3xl border border-dashed border-border/60">
           <MapIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
           <h3 className="text-2xl font-black mb-2 text-muted-foreground">No properties found</h3>
           <p className="text-muted-foreground font-medium">Try adjusting your filters or search terms to see more listings.</p>
        </div>
      )}
    </div>
  )
}
