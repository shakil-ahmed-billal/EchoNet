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
    <div className="flex flex-col gap-10 pb-15">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-primary">
            <div className="w-12 h-12 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-4xl font-black tracking-tighter">Marketplace</span>
          </div>
          <p className="text-muted-foreground font-medium pl-15">Discover premium products from verified sellers.</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="relative group min-w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                <Input
                placeholder="Search premium products..."
                className="pl-12 h-14 rounded-2xl bg-card border border-border/40 focus-visible:ring-primary/20 shadow-sm font-semibold text-sm transition-all duration-300"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>
            <Link href={store ? "/store" : "/store"}>
                <Button className="h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20 gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                    {store ? "Manage Shop" : "Open Shop"}
                </Button>
            </Link>
        </div>
      </div>

      <div className="space-y-8">
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
