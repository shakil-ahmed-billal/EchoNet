"use client"

import { useMyStore, useCreateStore, useProducts } from "@/hooks/use-marketplace"
import { Product } from "@/services/marketplace.service"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Store as StoreIcon, Package, ShoppingCart, Users, Plus, LayoutDashboard, Settings } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { AddProductModal } from "@/components/marketplace/add-product-modal"
import { ProductCard } from "@/components/marketplace/product-card"

export default function StoreDashboardPage() {
  const { data: store, isLoading } = useMyStore()
  const { mutate: createStore, isPending: isCreating } = useCreateStore()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const { data: myProducts, isLoading: isLoadingProducts } = useProducts({ storeId: store?.id })

  if (isLoading) {
    return (
        <div className="">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
            </div>
        </div>
    )
  }

  // If user doesn't have a store, show creation form
  if (!store && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
            <StoreIcon className="w-10 h-10" />
        </div>
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create Your Store</h1>
            <p className="text-muted-foreground">
                Turn your passion into a business. Set up your storefront and start selling on EchoNet.
            </p>
        </div>

        <Card className="w-full bg-card/50 backdrop-blur-md border-border/20 rounded-3xl overflow-hidden shadow-xl">
            <CardContent className="p-8 flex flex-col gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Store Name</label>
                    <Input 
                        placeholder="e.g. Shakil's Tech Shack" 
                        className="rounded-2xl h-12 bg-background/50"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Description</label>
                    <Textarea 
                        placeholder="Tell shoppers about your store..." 
                        className="rounded-2xl min-h-[120px] bg-background/50 resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>
                <Button 
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                    onClick={() => createStore(formData)}
                    disabled={isCreating || !formData.name}
                >
                    {isCreating ? "Creating Store..." : "Launch My Store"}
                </Button>
            </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto  flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                {store?.logoUrl ? (
                    <img src={store.logoUrl} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                    <StoreIcon className="w-8 h-8" />
                )}
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{store?.name}</h1>
                <p className="text-sm text-muted-foreground">Store Owner Dashboard</p>
            </div>
        </div>
        <div className="flex gap-2 sm:ml-auto">
            <Button variant="outline" className="rounded-xl gap-2">
                <Link href={`/store/${store?.id}`} className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Preview Store
                </Link>
            </Button>
            <Button className="rounded-xl gap-2">
                <Settings className="w-4 h-4" />
                Settings
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="Followers" 
            value={store?._count?.followers || 0} 
            icon={<Users className="w-5 h-5" />} 
            color="bg-blue-500/10 text-blue-500"
        />
        <StatCard 
            title="Products" 
            value={store?._count?.products || 0} 
            icon={<Package className="w-5 h-5" />} 
            color="bg-purple-500/10 text-purple-500"
        />
        <StatCard 
            title="Total Orders" 
            value={0} 
            icon={<ShoppingCart className="w-5 h-5" />} 
            color="bg-green-500/10 text-green-500"
        />
        <StatCard 
            title="Total Revenue" 
            value="$0.00" 
            icon={<StoreIcon className="w-5 h-5" />} 
            color="bg-yellow-500/10 text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-sm border-border/20 rounded-3xl overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Inventory</CardTitle>
                    <CardDescription>Manage your listed products</CardDescription>
                </div>
                <Button className="rounded-xl gap-2" size="sm" onClick={() => setIsAddProductOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Add Product
                </Button>
            </CardHeader>
            <CardContent>
                {isLoadingProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-48 rounded-2xl" />
                        <Skeleton className="h-48 rounded-2xl" />
                    </div>
                ) : myProducts && myProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {myProducts.map((product: Product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <Package className="w-12 h-12 mb-2" />
                        <p className="font-medium text-lg">No products yet</p>
                        <p className="text-sm">You haven't added any products to your store.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-3xl overflow-hidden shadow-sm">
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer purchases</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="text-center py-6 opacity-40">
                        <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">No recent orders</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <AddProductModal open={isAddProductOpen} onOpenChange={setIsAddProductOpen} />
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
    return (
        <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-2xl shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${color}`}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
                        <p className="text-2xl font-bold tracking-tight">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
