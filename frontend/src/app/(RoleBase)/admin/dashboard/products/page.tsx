"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flag, CheckCircle, XCircle, ExternalLink, Package } from "lucide-react"
import { useFlaggedProducts, useUpdateProductStatus } from "@/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination-controls"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

export default function AdminFlaggedProductsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useFlaggedProducts({ page, limit: 12 })
  const { mutate: updateStatus } = useUpdateProductStatus()

  const products: any[] = data?.data ?? (Array.isArray(data) ? data : [])
  const meta = data?.meta

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Flagged Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review products reported by users and take action.</p>
        </div>
        {meta?.total != null && meta.total > 0 && (
          <Badge className="rounded-full bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-black px-3">
            {meta.total} flagged
          </Badge>
        )}
      </div>

      {!isLoading && products.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-2xl">
          <Flag className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold">No flagged products.</p>
          <p className="text-xs mt-1">All clear! No products need review.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="rounded-2xl border border-border/40 p-0 overflow-hidden">
                  <Skeleton className="h-36 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-4" />
                    <div className="flex gap-2"><Skeleton className="h-8 flex-1" /><Skeleton className="h-8 flex-1" /></div>
                  </CardContent>
                </Card>
              ))
            : products.map((product) => (
                <Card key={product.id} className="rounded-2xl border border-red-500/20 hover:border-red-500/40 shadow-sm transition-all overflow-hidden p-0 bg-card">
                  <div className="relative h-36 bg-muted/20">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="rounded-full text-[10px] font-black bg-red-500/90 text-white border-none gap-1">
                        <Flag className="h-2.5 w-2.5" /> Flagged
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="font-bold text-sm line-clamp-1">{product.title}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1 mb-3">
                      <span>{product.store?.name}</span>
                      <span className="font-black text-foreground">৳{Number(product.price).toLocaleString()}</span>
                    </div>
                    {product.flags?.[0] && (
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-2 mb-3">
                        <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Latest Report</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{product.flags[0]?.reason}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(product.flags[0]?.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link href={`/marketplace/${product.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                      <Button size="sm" className="flex-1 rounded-xl gap-1 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus({ id: product.id, status: "ACTIVE" })}>
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 rounded-xl gap-1 text-xs text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => updateStatus({ id: product.id, status: "REJECTED" })}>
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      )}

      {meta && (
        <Pagination
          meta={{ ...meta, totalPages: meta.totalPages ?? Math.ceil(meta.total / 12) }}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
