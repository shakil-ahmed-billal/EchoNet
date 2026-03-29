"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || "")

  if (!images.length) {
    return (
      <div className="aspect-square bg-muted/20 rounded-2xl flex items-center justify-center text-muted-foreground/30 border border-border/10 font-bold text-[10px]">
        No Image Available
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-border/10 shadow-sm bg-card transition-all">
        <Image 
          src={activeImage} 
          alt={title} 
          fill 
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails Carousel */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img)}
              className={cn(
                "relative aspect-square w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                activeImage === img 
                  ? "border-primary shadow-sm ring-1 ring-primary/20" 
                  : "border-border/10 opacity-60 hover:opacity-100 hover:border-primary/40"
              )}
            >
              <Image src={img} alt={`${title} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
