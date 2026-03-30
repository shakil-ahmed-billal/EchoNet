"use client"

import { useState } from "react"
import { useFlaggedProducts, useUpdateProductStatus, useAdminProducts } from "@/hooks/use-admin"
import { apiClient } from "@/services/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Package, ShieldAlert, ShieldCheck } from "lucide-react"
import { Pagination } from "@/components/ui/pagination-controls"

const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      queryClient.invalidateQueries({ queryKey: ["flagged-products"] })
      toast.success("Product deleted")
    },
    onError: () => toast.error("Failed to delete product"),
  })
}

export default function ModeratorProductsPage() {
  const [page, setPage] = useState(1)
  const { data: response, isLoading } = useAdminProducts({ page, limit: 10 })
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateProductStatus()
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct()

  const products = response?.data || []
  const meta = response?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Flagged Products</h1>
        <p className="text-sm text-muted-foreground font-medium">Review marketplace products for policy violations and fraud.</p>
      </div>

      <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-border/10 hover:bg-transparent">
                  <TableHead className="font-bold text-xs pl-6 py-4">Product</TableHead>
                  <TableHead className="font-bold text-xs">Store</TableHead>
                  <TableHead className="font-bold text-xs w-[80px]">Price</TableHead>
                  <TableHead className="font-bold text-xs w-[120px]">Status</TableHead>
                  <TableHead className="font-bold text-xs text-right pr-6 w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/50">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldAlert className="size-6 animate-pulse text-muted-foreground/30" />
                        Loading product data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/60">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="size-8 opacity-40 mb-2" />
                        No products found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product: any) => (
                    <TableRow key={product.id} className="border-border/10 hover:bg-muted/5 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt={product.title} className="size-10 rounded-xl object-cover border border-border/20" />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs truncate text-foreground">{product.title}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{product.description?.slice(0, 40)}...</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {product.store?.name || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground">
                        ৳{product.price?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-full font-bold text-[10px] tracking-wider px-3 py-0.5 ${
                          product.status === "FLAGGED"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : product.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus({ id: product.id, status: "ACTIVE" })}
                            disabled={isUpdating || product.status === "ACTIVE"}
                            className="h-8 rounded-lg font-bold text-[10px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                          >
                            <ShieldCheck className="size-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => deleteProduct(product.id)}
                            disabled={isDeleting}
                            className="size-8 rounded-lg"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {meta?.totalPages > 1 && (
            <div className="border-t border-border/10 p-4 bg-muted/5 flex justify-center">
              <Pagination meta={{ page: meta.page || 1, totalPages: meta.totalPages || 1, total: meta.total || 0, limit: meta.limit || 10 }} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
