"use client"

import Link from "next/link"
import { useProperties } from "@/hooks/use-property"
import { PropertyCard } from "@/components/property/property-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, Map as MapIcon, Grid, List as ListIcon } from "lucide-react"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination-controls"

export default function PropertiesPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    searchTerm: "",
    listingType: "",
    category: "",
  })

  const { data, isLoading } = useProperties({ ...filters, page, limit: 12 })
  
  // Normalize data for pagination
  const properties: any[] = data?.data ?? (Array.isArray(data) ? data : [])
  const meta = data?.meta

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }))
    setPage(1) // Reset to first page on search
  }

  return (
    <div className="flex flex-col gap-10 w-full mx-auto pb-20">
      {/* Search & Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">EchoNet Properties</h1>
          <p className="text-muted-foreground font-medium pl-1 text-sm md:text-base">Elite real estate for the modern era.</p>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="outline" className="rounded-2xl h-14 px-8 font-black border-2 hover:bg-muted transition-all duration-300 shadow-sm">
              <MapIcon className="mr-2 h-4.5 w-4.5" /> Map View
           </Button>
           <Link href="/properties/new">
              <Button className="rounded-2xl h-14 px-10 font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                 Post Listing
              </Button>
           </Link>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col lg:flex-row gap-5 p-5 rounded-[32px] bg-card border border-border/40 shadow-xl backdrop-blur-xl">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5.5 w-5.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            <Input 
              placeholder="Search by area, location, or features..." 
              className="pl-14 h-16 rounded-[22px] bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-md font-semibold transition-all duration-300"
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
         </div>
         <div className="flex gap-4">
            <Button variant="outline" className="h-16 px-8 rounded-[22px] font-black border-2 hover:bg-muted transition-all duration-300">
               <SlidersHorizontal className="mr-2 h-5 w-5" /> Filter Results
            </Button>
            <div className="flex items-center bg-muted/30 p-2 rounded-[22px] border border-border/10">
               <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-background shadow-md">
                  <Grid className="h-5 w-5" />
               </Button>
               <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-muted-foreground/50 hover:text-foreground">
                  <ListIcon className="h-5 w-5" />
               </Button>
            </div>
         </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="space-y-5">
               <Skeleton className="h-72 w-full rounded-[35px]" />
               <Skeleton className="h-8 w-3/4 rounded-2xl" />
               <Skeleton className="h-6 w-1/2 rounded-2xl" />
               <div className="grid grid-cols-3 gap-4">
                 <Skeleton className="h-14 rounded-2xl" />
                 <Skeleton className="h-14 rounded-2xl" />
                 <Skeleton className="h-14 rounded-2xl" />
               </div>
             </div>
           ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="flex flex-col gap-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {properties.map((property: any) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {meta && (
            <Pagination 
              meta={{ ...meta, totalPages: meta.totalPages ?? Math.ceil(meta.total / 12) }} 
              onPageChange={setPage} 
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 text-center bg-muted/5 rounded-[40px] border-4 border-dashed border-border/40 transition-all duration-500 hover:bg-muted/10">
           <div className="h-24 w-24 rounded-full bg-muted/20 flex items-center justify-center mb-6">
              <MapIcon className="h-12 w-12 text-muted-foreground opacity-30" />
           </div>
           <h3 className="text-3xl font-black mb-3 text-muted-foreground">No properties listed</h3>
           <p className="text-muted-foreground font-semibold max-w-sm px-4">We couldn't find any properties matching your criteria. Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  )
}
