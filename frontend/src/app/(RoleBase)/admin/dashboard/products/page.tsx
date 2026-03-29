"use client"

import { useState } from "react"
import { useAdminProducts, useUpdateProductStatus } from "@/hooks/use-admin"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Package, Store } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination-controls"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminProductsPage() {
  const [page, setPage] = useState(1)
  
  const { data: response, isLoading } = useAdminProducts({
    page,
    limit: 8,
  })

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateProductStatus()

  // Ensure robust fallback since the API structure changed slightly
  const rawData = response?.data; 
  const products = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  const meta = response?.meta || rawData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const onClearFlag = (id: string) => {
    updateStatus({ id, status: "ACTIVE" })
  }

  const onSuspendProduct = (id: string) => {
    updateStatus({ id, status: "INACTIVE" })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Market Safety</h1>
          <p className="text-sm text-muted-foreground font-medium">Review reported marketplace listings and vendor behavior.</p>
        </div>
      </div>

      <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/10">
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="font-bold text-xs pl-6 py-4 w-[280px]">Listing</TableHead>
                <TableHead className="font-bold text-xs w-[160px]">Action State</TableHead>
                <TableHead className="font-bold text-xs hidden md:table-cell">Merchant</TableHead>
                <TableHead className="font-bold text-xs hidden lg:table-cell">Created</TableHead>
                <TableHead className="font-bold text-xs text-right pr-6 w-[200px]">Enforcement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/50">
                    <div className="flex flex-col items-center gap-2">
                       <ShieldAlert className="size-6 animate-pulse text-muted-foreground/30" />
                       Validating commerce integrity...
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center font-bold text-emerald-500/80">
                    <div className="flex flex-col items-center gap-2">
                       <Package className="size-8 opacity-40 mb-2" />
                       No products registered in the database.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: any) => (
                  <TableRow key={product.id} className="border-border/10 hover:bg-muted/5 transition-colors group">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative size-10 rounded-xl bg-muted/20 border border-border/10 flex items-center justify-center shrink-0 overflow-hidden">
                           {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="object-cover size-full" />
                           ) : (
                              <Package className="size-5 text-muted-foreground/40" />
                           )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm tracking-tight truncate text-foreground">{product.title}</span>
                          <span className="text-[10px] font-bold text-primary">${product.price} USD</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="destructive"
                        className="rounded-full font-bold text-[9px] tracking-wider px-3 py-0.5 bg-rose-500/10 text-rose-600 border-rose-500/20"
                      >
                        {product.status} — Under Review
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-medium text-muted-foreground/80">
                       <div className="flex items-center gap-1.5">
                          <Store className="size-3.5 opacity-40 shrink-0" />
                          <span className="truncate">{product.store?.name || "Unknown Vendor"}</span>
                       </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs font-medium text-muted-foreground/80">
                      {format(new Date(product.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <Button 
                             size="sm"
                             variant="outline"
                             onClick={() => onClearFlag(product.id)}
                             disabled={isUpdating}
                             className="h-8 rounded-lg font-bold text-[10px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                          >
                             Validate
                          </Button>
                          <Button 
                             size="sm"
                             variant="destructive"
                             onClick={() => onSuspendProduct(product.id)}
                             disabled={isUpdating}
                             className="h-8 rounded-lg font-bold text-[10px]"
                          >
                             Takedown
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
          
          {meta && meta.totalPages > 1 && (
            <div className="border-t border-border/10 p-4 bg-muted/5 flex justify-center">
              <Pagination 
                meta={{ page: meta.page || 1, totalPages: meta.totalPages || Math.ceil((meta.total || 0) / (meta.limit || 10)), total: meta.total || 0, limit: meta.limit || 10 }}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
