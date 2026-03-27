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
  const { data: store } = useMyStore()

  return (
    <div className="flex flex-col gap-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary mb-1">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black ">Marketplace</span>
          </div>

        </div>

        <div className="flex items-center gap-3">
            <div className="relative group min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                placeholder="Search premium products..."
                className="pl-12 h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/20 backdrop-blur-sm shadow-inner font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Link href={store ? "/store" : "/store"}>
                <Button className="h-12 px-6 rounded-2xl font-black shadow-lg shadow-primary/20 gap-2">
                    {store ? "Manage My Store" : "Open Store"}
                </Button>
            </Link>
        </div>
      </div>

      <CategoryPills
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <ProductGrid category={selectedCategory} search={search} />
    </div>
  )
}
