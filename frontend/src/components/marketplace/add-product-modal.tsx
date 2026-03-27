"use client"

import { useEffect, useState } from "react"
import { useCreateProduct, useUpdateProduct, useCategories } from "@/hooks/use-marketplace"
import { Category, Product } from "@/services/marketplace.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImagePlus, Loader2, X } from "lucide-react"

interface AddProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

export function AddProductModal({ open, onOpenChange, product }: AddProductModalProps) {
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct()
  const { data: categories } = useCategories()
  
  const isPending = isCreating || isUpdating
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "1",
    categoryId: "",
    images: [] as string[]
  })

  useEffect(() => {
    if (product && open) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryId: product.category?.id || "",
        images: product.images || []
      })
    } else if (!product && open) {
      setFormData({
        title: "", description: "", price: "", stock: "1", categoryId: "", images: []
      })
    }
  }, [product, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (product) {
      updateProduct({ id: product.id, data: { ...formData, price: Number(formData.price), stock: Number(formData.stock) } }, {
        onSuccess: () => {
          onOpenChange(false)
        }
      })
    } else {
      createProduct({ ...formData, price: Number(formData.price), stock: Number(formData.stock) }, {
          onSuccess: () => {
              onOpenChange(false)
              setFormData({ title: "", description: "", price: "", stock: "1", categoryId: "", images: [] })
          }
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-border/20 bg-card/95 backdrop-blur-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold">{product ? "Edit Product" : "List a New Product"}</DialogTitle>
            <DialogDescription>
                {product ? "Update your product details below." : "Fill in the details below to add a new item to your store."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
            <div className="space-y-2">
              <Label htmlFor="title" className="ml-1">Product Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Vintage Camera" 
                className="rounded-2xl h-12 bg-background/50"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price" className="ml-1">Price ($)</Label>
                    <Input 
                        id="price" 
                        type="number" 
                        placeholder="0.00" 
                        className="rounded-2xl h-12 bg-background/50"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock" className="ml-1">Stock</Label>
                    <Input 
                        id="stock" 
                        type="number" 
                        placeholder="1" 
                        className="rounded-2xl h-12 bg-background/50"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
              <Label className="ml-1">Category</Label>
              <select 
                value={formData.categoryId} 
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                required
                className="w-full rounded-2xl h-12 bg-background/50 border border-border/20 px-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
              >
                <option value="" disabled>Select a category</option>
                {categories?.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="ml-1">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Tell buyers about your product..." 
                className="rounded-2xl min-h-[100px] bg-background/50 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
                <Label className="ml-1">Product Images</Label>
                <div className="grid grid-cols-4 gap-2">
                    <button 
                        type="button"
                        className="aspect-square rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all bg-background/30"
                        onClick={() => {
                            // Mock image upload
                            const mockUrl = "https://picsum.photos/seed/" + Math.random() + "/400"
                            setFormData({...formData, images: [...formData.images, mockUrl]})
                        }}
                    >
                        <ImagePlus className="w-6 h-6 border-none" />
                        <span className="text-[10px] mt-1 font-medium">Add Image</span>
                    </button>
                    {formData.images.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/30">
            <Button 
                type="button" 
                variant="ghost" 
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
            >
                Cancel
            </Button>
             <Button 
                type="submit" 
                className="rounded-xl px-10 font-bold"
                disabled={isPending}
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {product ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
