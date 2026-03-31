"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Bath, Move, MapPin, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getOptimizedImageUrl } from "@/lib/image-utils"

interface PropertyCardProps {
  property: any
}

export function PropertyCard({ property }: PropertyCardProps) {
  const coverImage = property.images?.find((img: any) => img.isCover)?.url || property.images?.[0]?.url

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group rounded-3xl bg-card/50 backdrop-blur-sm border border-border/40 p-0">
      <Link href={`/properties/${property.id}`} className="block relative h-64 w-full">
        <Image
          src={getOptimizedImageUrl(coverImage || "/placeholder-property.jpg", { width: 600, height: 400 })}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className={`font-black px-3 py-1 rounded-full shadow-lg ${
            property.listingType === 'SALE' ? 'bg-orange-500' : 
            property.listingType === 'RENT' ? 'bg-blue-500' : 'bg-emerald-500'
          }`}>
            {property.listingType}
          </Badge>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 rounded-full bg-background/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </Link>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-bold">{property.area}, {property.city}</span>
        </div>
        <Link href={`/properties/${property.id}`}>
          <h3 className="font-black text-xl leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>
        <div className="flex items-baseline gap-1 mt-4">
          <span className="text-2xl font-black text-primary">৳{Number(property.price).toLocaleString()}</span>
          {property.priceUnit === 'PER_MONTH' && (
            <span className="text-xs font-bold text-muted-foreground">/ Month</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-border/20">
          <div className="flex items-center gap-2 group/icon">
            <Bed className="h-4 w-4 text-primary/60 group-hover/icon:text-primary transition-colors" />
            <span className="text-sm font-black">{property.details?.bedrooms || 0}</span>
          </div>
          <div className="flex items-center gap-2 group/icon">
            <Bath className="h-4 w-4 text-primary/60 group-hover/icon:text-primary transition-colors" />
            <span className="text-sm font-black">{property.details?.bathrooms || 0}</span>
          </div>
          <div className="flex items-center gap-2 group/icon">
            <Move className="h-4 w-4 text-primary/60 group-hover/icon:text-primary transition-colors" />
            <span className="text-sm font-black">{property.details?.areaSqft || 0} <span className="text-[10px] font-bold text-muted-foreground ml-0.5">sqft</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
