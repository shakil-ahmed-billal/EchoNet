"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Home, Search, CheckCircle, XCircle, Eye, MapPin, BedDouble, Bath } from "lucide-react"
import { useAdminProperties, useApproveProperty, useRejectProperty } from "@/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination-controls"
import Image from "next/image"
import Link from "next/link"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  INACTIVE: "bg-muted text-muted-foreground border-border/40",
  REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
}

export default function AdminPropertiesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminProperties({ status: statusFilter || undefined, searchTerm: search || undefined, page, limit: 12 })
  const { mutate: approve } = useApproveProperty()
  const { mutate: reject } = useRejectProperty()

  const properties: any[] = data?.data ?? (Array.isArray(data) ? data : [])
  const meta = data?.meta

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Properties</h1>
          <p className="text-muted-foreground mt-1 text-sm">Approve, reject, and manage property listings.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-9 rounded-xl border-border/40"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["PENDING", "ACTIVE", "REJECTED", ""].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs font-bold"
            onClick={() => { setStatusFilter(s); setPage(1) }}
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl border border-border/40 p-0 overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <div className="flex gap-2"><Skeleton className="h-8 flex-1" /><Skeleton className="h-8 flex-1" /></div>
                </CardContent>
              </Card>
            ))
          : properties.map((prop) => {
              const cover = prop.images?.find((i: any) => i.isCover) ?? prop.images?.[0]
              return (
                <Card key={prop.id} className="rounded-2xl border border-border/40 hover:border-border/70 shadow-sm transition-all overflow-hidden p-0 bg-card">
                  <div className="relative h-40 bg-muted/30">
                    {cover ? (
                      <Image src={cover.url} alt={prop.title} fill className="object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Home className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-wider border rounded-full ${STATUS_COLORS[prop.status] ?? STATUS_COLORS.INACTIVE}`}>
                        {prop.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="font-bold text-sm line-clamp-1">{prop.title}</p>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1 mb-3">
                      <MapPin className="h-3 w-3" /> {prop.area}, {prop.city}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      {prop.details?.bedrooms != null && (
                        <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{prop.details.bedrooms}</span>
                      )}
                      {prop.details?.bathrooms != null && (
                        <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{prop.details.bathrooms}</span>
                      )}
                      <span className="ml-auto font-black text-foreground">৳{Number(prop.price).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/properties/${prop.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                      {prop.status === "PENDING" && (
                        <>
                          <Button size="sm" className="flex-1 rounded-xl text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => approve(prop.id)}>
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs gap-1 text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => reject(prop.id)}>
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {!isLoading && properties.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <Home className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold">No properties found.</p>
        </div>
      )}

      {meta && (
        <Pagination
          meta={{ ...meta, totalPages: meta.totalPages ?? Math.ceil(meta.total / 12) }}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        />
      )}
    </div>
  )
}
