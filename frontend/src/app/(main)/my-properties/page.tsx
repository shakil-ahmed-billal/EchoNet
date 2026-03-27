"use client"

import { useMyProperties, useDeleteProperty } from "@/hooks/use-property"
import { PropertyCard } from "@/components/property/property-card"
import { Button } from "@/components/ui/button"
import { Plus, LayoutGrid, Settings, Trash2, Eye, Edit3, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function MyPropertiesPage() {
  const { data: properties, isLoading } = useMyProperties()
  const { mutate: deleteProperty } = useDeleteProperty()

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black">My Property Dashboard</h1>
          <p className="text-muted-foreground font-medium">Manage your listings, track performance and respond to enquiries.</p>
        </div>
        <Link href="/properties/new">
          <Button className="rounded-full h-14 px-8 font-black shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
            <Plus className="mr-2 h-5 w-5" /> List New Property
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 space-y-2">
             <p className="text-xs font-black text-primary/60">Total Listings</p>
             <h3 className="text-4xl font-black">{properties?.length || 0}</h3>
          </div>
          <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 space-y-2">
             <p className="text-xs font-black text-emerald-500/60">Active Listings</p>
             <h3 className="text-4xl font-black">{properties?.filter((p: any) => p.status === 'ACTIVE').length || 0}</h3>
          </div>
          <div className="p-8 rounded-[32px] bg-orange-500/5 border border-orange-500/10 space-y-2">
             <p className="text-xs font-black text-orange-500/60">Pending Review</p>
             <h3 className="text-4xl font-black">{properties?.filter((p: any) => p.status === 'PENDING').length || 0}</h3>
          </div>
      </div>

      <div className="rounded-[40px] border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="py-6 px-8 font-black text-[10px]">Property</TableHead>
              <TableHead className="font-black text-[10px]">Type</TableHead>
              <TableHead className="font-black text-[10px]">Price</TableHead>
              <TableHead className="font-black text-[10px]">Status</TableHead>
              <TableHead className="font-black text-[10px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               [1, 2, 3].map(i => (
                  <TableRow key={i}>
                    <TableCell className="p-8"><Skeleton className="h-12 w-48 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-10 w-24 ml-auto rounded-xl" /></TableCell>
                  </TableRow>
               ))
            ) : properties?.map((property: any) => (
              <TableRow key={property.id} className="hover:bg-muted/10 transition-colors group">
                <TableCell className="py-6 px-8">
                  <div className="flex items-center gap-4">
                     <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden relative border border-border/40">
                        {property.images?.[0] && <Image src={property.images[0].url} alt="" fill className="object-cover" />}
                     </div>
                     <div>
                        <p className="font-black text-lg line-clamp-1">{property.title}</p>
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-1">
                           <MapPin className="h-3 w-3" /> {property.area}, {property.city}
                        </p>
                     </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-black px-3 py-1 rounded-full border-2">
                    {property.listingType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="font-black text-lg">৳{Number(property.price).toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">{property.priceUnit}</p>
                </TableCell>
                <TableCell>
                  <Badge className={`font-black px-3 py-1 rounded-full shadow-lg ${
                    property.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-orange-500'
                  }`}>
                    {property.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-6 px-8 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/properties/${property.id}`}>
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-background border border-border/40 hover:bg-primary/5 hover:text-primary transition-all">
                          <Eye className="h-4 w-4" />
                       </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-background border border-border/40 hover:border-blue-500/40 hover:text-blue-500 transition-all">
                       <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-10 w-10 rounded-xl bg-background border border-border/40 hover:border-red-500/40 hover:text-red-500 transition-all"
                       onClick={() => { if(confirm('Delete property?')) deleteProperty(property.id) }}
                    >
                       <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
