"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Move, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getOptimizedImageUrl } from "@/lib/image-utils"

interface PropertyCardProps {
  property: any
}

export function PropertyCard({ property }: PropertyCardProps) {
  const coverImage = property.images?.find((img: any) => img.isCover)?.url || property.images?.[0]?.url

  const listingColor =
    property.listingType === "SALE"
      ? "bg-orange-500"
      : property.listingType === "RENT"
      ? "bg-blue-500"
      : "bg-emerald-500"

  return (
    <Card className="overflow-hidden shadow-none hover:shadow-xl transition-all group md:rounded-2xl bg-card/60 backdrop-blur-sm border border-border/20 p-0">
      <Link href={`/properties/${property.id}`} className="block relative h-36 md:h-56 w-full">
        <Image
          src={getOptimizedImageUrl(coverImage || "/placeholder-property.jpg", { width: 600, height: 400 })}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 md:top-4 md:left-4">
          <Badge className={`font-black text-[10px] md:text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg ${listingColor}`}>
            {property.listingType}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-3 md:p-5">
        <div className="flex items-center gap-1 text-muted-foreground mb-1">
          <MapPin className="h-3 w-3 text-primary shrink-0" />
          <span className="text-[10px] md:text-xs font-bold truncate">{property.area}, {property.city}</span>
        </div>
        <Link href={`/properties/${property.id}`}>
          <h3 className="font-black text-sm md:text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>
        <span className="text-base md:text-xl font-black text-primary">
          ৳{Number(property.price).toLocaleString()}
          {property.priceUnit === "PER_MONTH" && (
            <span className="text-[10px] font-bold text-muted-foreground ml-1">/mo</span>
          )}
        </span>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/20">
          <div className="flex items-center gap-1">
            <Bed className="h-3 w-3 md:h-4 md:w-4 text-primary/60" />
            <span className="text-xs font-black">{property.details?.bedrooms || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-3 w-3 md:h-4 md:w-4 text-primary/60" />
            <span className="text-xs font-black">{property.details?.bathrooms || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Move className="h-3 w-3 md:h-4 md:w-4 text-primary/60" />
            <span className="text-xs font-black">{property.details?.areaSqft || 0}<span className="text-[9px] ml-0.5 text-muted-foreground">sqft</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
