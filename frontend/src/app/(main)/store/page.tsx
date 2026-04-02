"use client"

import { useMyStore, useCreateStore, useProducts, useStoreOrders, useDeleteProduct } from "@/hooks/use-marketplace"
import { Product } from "@/services/marketplace.service"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Store as StoreIcon, Package, ShoppingCart, Users, Plus, LayoutDashboard, Settings, Edit, Trash2, Loader2 } from "lucide-react"
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const { data: myProducts, isLoading: isLoadingProducts } = useProducts({ storeId: store?.id })
  const { data: storeOrders, isLoading: isLoadingOrders } = useStoreOrders()
  const { mutate: deleteProduct } = useDeleteProduct()

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsAddProductOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id)
    }
  }

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

        <Card className="w-full bg-card/50 backdrop-blur-md border-border/20 rounded-3xl overflow-hidden shadow-xl p-0">
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
    <div className="flex flex-col gap-4 md:gap-6 max-w-4xl mx-auto w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header Card */}
      <div className="bg-card/60 backdrop-blur-sm md:rounded-2xl border border-border/20 shadow-sm p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
            {store?.logoUrl ? (
              <img src={store.logoUrl} className="size-full object-cover" />
            ) : (
              <StoreIcon className="size-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">{store?.name}</h1>
            <p className="text-sm text-muted-foreground font-medium">Store Dashboard</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <Link href={`/store/${store?.id}`}>
              <Button variant="outline" className="rounded-xl h-10 px-4 font-bold border-border/20 text-xs">
                 Preview
              </Button>
            </Link>
            <Button className="rounded-xl h-10 px-4 font-bold shadow-md shadow-primary/20 text-xs">
               Settings
            </Button>
          </div>
        </div>
        
        <div className="md:hidden grid grid-cols-2 gap-2">
            <Link href={`/store/${store?.id}`}>
              <Button variant="outline" className="w-full rounded-xl h-10 font-bold border-border/20 text-xs">
                 Preview
              </Button>
            </Link>
            <Button className="w-full rounded-xl h-10 font-bold shadow-md shadow-primary/20 text-xs">
               Settings
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <StatCard 
            title="Followers" 
            value={store?._count?.followers || 0} 
            icon={<Users className="size-4" />} 
            color="bg-primary/10 text-primary"
        />
        <StatCard 
            title="Products" 
            value={store?._count?.products || 0} 
            icon={<Package className="size-4" />} 
            color="bg-primary/10 text-primary"
        />
        <StatCard 
            title="Orders" 
            value={storeOrders?.length || 0} 
            icon={<ShoppingCart className="size-4" />} 
            color="bg-primary/10 text-primary"
        />
        <StatCard 
            title="Revenue" 
            value={`$${Number(storeOrders?.reduce((acc: number, o: any) => acc + (Number(o.totalAmount) || 0), 0) || 0).toFixed(0)}`} 
            icon={<StoreIcon className="size-4" />} 
            color="bg-primary/10 text-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm border-border/20 shadow-sm md:rounded-2xl overflow-hidden p-0">
            <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold">Inventory</CardTitle>
                    <CardDescription className="text-xs">Manage your products</CardDescription>
                </div>
                <Button className="rounded-xl h-9 px-4 text-xs font-bold shadow-md shadow-primary/20" onClick={() => setIsAddProductOpen(true)}>
                    <Plus className="size-4 mr-1.5" />
                    Add Product
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                {isLoadingProducts ? (
                    <div className="p-10 flex justify-center"><Loader2 className="size-8 animate-spin text-primary/30" /></div>
                ) : (myProducts?.data?.length ?? 0) > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] text-muted-foreground uppercase tracking-wider bg-muted/30 font-bold">
                                <tr>
                                    <th className="px-5 py-3">Product</th>
                                    <th className="px-5 py-3">Price</th>
                                    <th className="px-5 py-3 hidden sm:table-cell">Stock</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {myProducts.data.map((product: Product) => (
                                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                              <div className="size-10 rounded-lg overflow-hidden border border-border/10 shrink-0">
                                                  {product.images?.[0] ? (
                                                      <img src={product.images[0]} alt={product.title} className="size-full object-cover" />
                                                  ) : (
                                                      <div className="size-full bg-muted flex items-center justify-center">
                                                          <Package className="size-4 text-muted-foreground/30" />
                                                      </div>
                                                  )}
                                              </div>
                                              <span className="font-bold text-foreground truncate max-w-[150px]">{product.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-primary">${Number(product.price).toLocaleString()}</td>
                                        <td className="px-5 py-4 hidden sm:table-cell text-muted-foreground font-medium">{product.stock}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => handleEdit(product)}>
                                                    <Edit className="size-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <Package className="size-12 mb-2" />
                        <p className="font-bold">No products</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border/20 md:rounded-2xl overflow-hidden shadow-sm flex flex-col p-0">
            <CardHeader className="p-4 md:p-6 pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
                        <CardDescription className="text-xs">Latest activity</CardDescription>
                    </div>
                    <Link href="/store/orders">
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">View All</Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {isLoadingOrders ? (
                    <div className="p-6 flex justify-center"><Loader2 className="size-6 animate-spin text-primary/30" /></div>
                ) : storeOrders && storeOrders.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {storeOrders.slice(0, 3).map((order: any) => (
                            <Link href="/store/orders" key={order.id} className="p-3 bg-muted/20 rounded-xl border border-border/10 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                <div className="min-w-0">
                                    <p className="font-bold text-xs truncate">{order.buyer?.name || 'Customer'}</p>
                                    <p className="text-[10px] text-muted-foreground">{order.items.length} item(s)</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-bold text-xs text-primary">${Number(order.totalAmount || 0).toLocaleString()}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 opacity-30">
                        <ShoppingCart className="size-8 mx-auto mb-2" />
                        <p className="text-xs font-bold">No orders</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      <AddProductModal 
        open={isAddProductOpen} 
        onOpenChange={(open) => {
            setIsAddProductOpen(open)
            if (!open) {
                // slightly wait for modal close animation before clearing
                setTimeout(() => setEditingProduct(null), 300)
            }
        }} 
        product={editingProduct}
      />
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
    return (
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20 md:rounded-2xl shadow-sm p-0">
            <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${color}`}>
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">{title}</p>
                        <p className="text-lg md:text-xl font-bold tracking-tight text-foreground truncate">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
