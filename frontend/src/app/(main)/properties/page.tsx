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
    <div className="flex flex-col gap-4 md:gap-6 max-w-4xl mx-auto w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header Card */}
      <div className="bg-card/60 backdrop-blur-sm md:rounded-2xl border border-border/20 shadow-sm p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <MapIcon className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Properties</h1>
            <p className="text-sm text-muted-foreground font-medium">Elite real estate for the modern era.</p>
          </div>
          <div className="ml-auto hidden sm:block">
             <Link href="/properties/new">
                <Button className="rounded-xl h-10 px-6 font-bold shadow-md shadow-primary/20 transition-all active:scale-95">
                    Post Listing
                </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by area or location..."
              className="pl-10 h-11 rounded-xl bg-background/50 border-border/20"
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="sm:hidden w-full">
             <Link href="/properties/new">
                <Button className="w-full rounded-xl h-11 font-bold shadow-md shadow-primary/20 transition-all active:scale-95">
                    Post Listing
                </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
           {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="space-y-4">
               <Skeleton className="h-64 w-full md:rounded-2xl" />
               <Skeleton className="h-6 w-3/4 rounded-xl mx-4 md:mx-0" />
               <Skeleton className="h-4 w-1/2 rounded-xl mx-4 md:mx-0" />
             </div>
           ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 px-3">
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
