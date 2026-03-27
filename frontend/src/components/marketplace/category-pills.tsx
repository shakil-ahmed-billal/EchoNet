"use client"

import { useCategories } from "@/hooks/use-marketplace"
import { Category } from "@/services/marketplace.service"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface CategoryPillsProps {
  selectedCategory?: string
  onSelect: (id: string | undefined) => void
}

export function CategoryPills({ selectedCategory, onSelect }: CategoryPillsProps) {
  const { data: categories, isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap mb-8 -mx-1">
      <div className="flex w-max gap-3 p-1">
        <button
          onClick={() => onSelect(undefined)}
          className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all duration-300 ${
            !selectedCategory 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          All Items
        </button>
        {(Array.isArray(categories) ? categories : categories?.data ?? []).map((category: Category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all duration-300 ${
              selectedCategory === category.id 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  )
}
