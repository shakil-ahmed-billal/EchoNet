"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, X, Check, Image as ImageIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface PropertyImageFile {
  file?: File
  url: string
  isCover: boolean
  id?: string // For existing images
}

interface ImageUploadProps {
  value: PropertyImageFile[]
  onChange: (value: PropertyImageFile[]) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Clean up selection
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: PropertyImageFile[] = Array.from(files).map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      isCover: value.length === 0 && index === 0,
    }))

    onChange([...value, ...newImages])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeImage = (index: number) => {
    const target = value[index]
    if (target.file) {
      URL.revokeObjectURL(target.url)
    }
    
    const newImages = [...value]
    newImages.splice(index, 1)

    // Ensure there's always a cover if images exist
    if (target.isCover && newImages.length > 0) {
      newImages[0].isCover = true
    }
    
    onChange(newImages)
  }

  const setCover = (index: number) => {
    const newImages = value.map((img, i) => ({
      ...img,
      isCover: i === index,
    }))
    onChange(newImages)
  }

  // Cleanup effect for blob URLs
  useEffect(() => {
    return () => {
      value.forEach(img => {
        if (img.file) URL.revokeObjectURL(img.url)
      })
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {value.map((image, index) => (
          <div 
            key={image.id || image.url} 
            className={cn(
                "relative group aspect-square rounded-2xl overflow-hidden border transition-all duration-300",
                image.isCover ? "border-primary ring-1 ring-primary/20 shadow-sm" : "border-border/40 hover:border-primary/30 bg-muted/10"
            )}
          >
            <Image src={image.url} alt="Property" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            
            <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-2">
              <div className="flex justify-end">
                <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="h-6 w-6 rounded-lg bg-red-500/80 backdrop-blur-sm border-none" 
                    onClick={() => removeImage(index)}
                    disabled={disabled}
                >
                    <X className="h-3 w-3" />
                </Button>
              </div>
              
              {!image.isCover && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-full text-[9px] h-6 font-bold rounded-lg bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white/40"
                  onClick={() => setCover(index)}
                  disabled={disabled}
                >
                  Set as Cover
                </Button>
              )}
            </div>

            {image.isCover && (
              <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md text-primary-foreground text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="h-2 w-2" /> COVER
              </div>
            )}
          </div>
        ))}

        {value.length < 10 && (
          <button
            type="button"
            disabled={disabled}
            className={cn(
               "aspect-square rounded-2xl border-2 border-dashed border-border/30 bg-muted/5 flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-primary/5 hover:border-primary/30 transition-all active:scale-95 disabled:opacity-50",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="h-8 w-8 rounded-xl bg-background border border-border/30 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all">
               <Upload className="h-4 w-4" />
            </div>
            <div className="text-center">
                <span className="block text-[10px] font-bold text-foreground">Add Photos</span>
                <span className="block text-[8px] font-medium text-muted-foreground opacity-60">Max 10</span>
            </div>
          </button>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        accept="image/*" 
        onChange={handleSelect} 
      />

      {value.length === 0 && (
        <div className="py-8 border-2 border-dashed border-border/20 rounded-[24px] bg-muted/5 flex flex-col items-center justify-center text-center group hover:bg-muted/10 transition-all">
           <div className="w-10 h-10 rounded-xl bg-background border border-border/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
              <ImageIcon className="h-5 w-5 text-muted-foreground opacity-30" />
           </div>
           <h4 className="text-sm font-bold">Upload Photos</h4>
           <p className="text-[10px] text-muted-foreground max-w-[150px] mt-1 mx-auto">
             At least one cover photo is required.
           </p>
           <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="mt-4 rounded-xl px-4 h-8 text-[11px] font-bold bg-background shadow-sm hover:bg-primary hover:text-primary-foreground"
                onClick={() => fileInputRef.current?.click()}
            >
               Browse Gallery
           </Button>
        </div>
      )}
    </div>
  )
}
