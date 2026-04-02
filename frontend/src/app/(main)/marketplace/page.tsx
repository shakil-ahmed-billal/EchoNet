"use client"

import { useState } from "react"
import { CategoryPills } from "@/components/marketplace/category-pills"
import { ProductGrid } from "@/components/marketplace/product-grid"
import { Input } from "@/components/ui/input"
import { Search, ShoppingBag } from "lucide-react"
import { useMyStore } from "@/hooks/use-marketplace"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data: store } = useMyStore()

  const handleCategorySelect = (id: string | undefined) => {
    setSelectedCategory(id)
    setPage(1) // Reset to first page on category change
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page on search
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-4xl mx-auto w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header Card */}
      <div className="bg-card/60 backdrop-blur-sm md:rounded-2xl border border-border/20 shadow-sm p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <ShoppingBag className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
            <p className="text-sm text-muted-foreground font-medium">Verified premium products</p>
          </div>
          <div className="ml-auto hidden sm:block">
             <Link href="/store">
                <Button className="rounded-xl h-10 px-6 font-bold shadow-md shadow-primary/20">
                    {store ? "Manage Shop" : "Open Shop"}
                </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search products..."
              className="pl-10 h-11 rounded-xl bg-background/50 border-border/20"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="sm:hidden w-full">
             <Link href="/store">
                <Button className="w-full rounded-xl h-11 font-bold shadow-md shadow-primary/20">
                    {store ? "Manage Shop" : "Open Shop"}
                </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-4 md:gap-6">
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
        />

        <ProductGrid 
          category={selectedCategory} 
          search={search} 
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
