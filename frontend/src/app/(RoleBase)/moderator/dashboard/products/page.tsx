"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flag, CheckCircle, XCircle, ExternalLink, Package, Search } from "lucide-react"
import { useFlaggedProducts, useUpdateProductStatus } from "@/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination-controls"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

export default function ModeratorFlaggedProductsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useFlaggedProducts({ page, limit: 12 })
  const { mutate: updateStatus } = useUpdateProductStatus()

  const products: any[] = data?.data ?? (Array.isArray(data) ? data : [])
  const meta = data?.meta

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Flagged Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review and take action on reported products.</p>
        </div>
        {meta?.total != null && meta.total > 0 && (
          <Badge className="rounded-full bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-black px-3">
            {meta.total} pending
          </Badge>
        )}
      </div>

      {!isLoading && products.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-border/30 rounded-2xl text-muted-foreground">
          <Flag className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-bold">No flagged products</p>
          <p className="text-xs mt-1">Nothing needs review right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="rounded-2xl border border-border/40 p-0">
                  <CardContent className="p-4 flex gap-4">
                    <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
                    <div className="flex-1"><Skeleton className="h-4 w-1/2 mb-2" /><Skeleton className="h-3 w-3/4 mb-4" /><div className="flex gap-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div></div>
                  </CardContent>
                </Card>
              ))
            : products.map((product) => (
                <Card key={product.id} className="rounded-2xl border border-red-500/20 shadow-sm transition-all hover:border-red-500/40 overflow-hidden p-0 bg-card">
                  <CardContent className="p-4 flex gap-4 items-start">
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted/20 shrink-0">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-sm line-clamp-1">{product.title}</p>
                        <Badge className="rounded-full text-[10px] bg-red-500/10 text-red-600 border border-red-500/20 shrink-0">Flagged</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{product.store?.name} · ৳{Number(product.price).toLocaleString()}</p>
                      {product.flags?.[0] && (
                        <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-2 py-1 mb-3 line-clamp-1">
                          <span className="font-bold text-red-500">Report: </span>{product.flags[0].reason}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/marketplace/${product.id}`} target="_blank">
                          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1 h-8">
                            <ExternalLink className="h-3 w-3" /> View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="rounded-xl text-xs gap-1 h-8 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => updateStatus({ id: product.id, status: "ACTIVE" })}
                        >
                          <CheckCircle className="h-3 w-3" /> Dismiss Flag
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-xs gap-1 h-8 text-red-500 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => updateStatus({ id: product.id, status: "REJECTED" })}
                        >
                          <XCircle className="h-3 w-3" /> Remove
                        </Button>
                      </div>
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
