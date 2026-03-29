"use client"

import { useState } from "react"
import { useAdminProperties, useApproveProperty, useRejectProperty } from "@/hooks/use-admin"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Home, User, Check, X } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination-controls"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function AdminPropertiesPage() {
  const [page, setPage] = useState(1)
  const [filterType, setFilterType] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING")

  const { data: response, isLoading } = useAdminProperties({
    page,
    limit: 10,
    status: filterType,
  })

  // Destructure with robust fallbacks
  const rawData = response?.data;
  const properties = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  const meta = response?.meta || rawData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const { mutate: approve, isPending: isApproving } = useApproveProperty()
  const { mutate: reject, isPending: isRejecting } = useRejectProperty()

  const isMutating = isApproving || isRejecting

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Estate Review</h1>
          <p className="text-sm text-muted-foreground font-medium">Verify structural integrity and authorize real estate listings.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-2xl border border-border/10 backdrop-blur-sm self-start md:self-auto">
          {["PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterType(status as any); setPage(1); }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black transition-all",
                filterType === status 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/10">
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="font-bold text-xs pl-6 py-4 w-[280px]">Property Registry</TableHead>
                <TableHead className="font-bold text-xs w-[160px]">Valuation</TableHead>
                <TableHead className="font-bold text-xs hidden md:table-cell">Lister Identity</TableHead>
                <TableHead className="font-bold text-xs hidden lg:table-cell">Submission Date</TableHead>
                <TableHead className="font-bold text-xs text-right pr-6 w-[200px]">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/50">
                    <div className="flex flex-col items-center gap-2">
                       <ShieldAlert className="size-6 animate-pulse text-muted-foreground/30" />
                       Fetching real estate ledger...
                    </div>
                  </TableCell>
                </TableRow>
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center font-bold text-emerald-500/80">
                    <div className="flex flex-col items-center gap-2">
                       <ShieldCheck className="size-8 opacity-80" />
                       No listings found for the current query.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property: any) => (
                  <TableRow key={property.id} className="border-border/10 hover:bg-muted/5 transition-colors group">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-xl bg-muted/20 border border-border/10 flex items-center justify-center shrink-0 overflow-hidden">
                           {property.images?.[0] ? (
                              <img src={property.images[0]} alt="" className="object-cover size-full" />
                           ) : (
                              <Home className="size-5 text-muted-foreground/40" />
                           )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm tracking-tight truncate text-foreground">{property.title}</span>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                             <span>{property.type}</span>
                             <span className="size-1 rounded-full bg-border" />
                             <span className="truncate">{property.location}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-1">
                          <span className="font-black tracking-tight text-primary">${property.price.toLocaleString()}</span>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "w-fit rounded-full font-bold text-[9px] tracking-wider px-2 py-0.5",
                              property.status === "PENDING" && "bg-amber-500/10 text-amber-600 border-amber-500/20 border",
                              property.status === "APPROVED" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 border",
                              property.status === "REJECTED" && "bg-rose-500/10 text-rose-600 border-rose-500/20 border"
                            )}
                          >
                            {property.status}
                          </Badge>
                       </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-medium text-muted-foreground/80">
                       <div className="flex items-center gap-1.5 border border-border/40 w-fit pl-1.5 pr-2.5 py-0.5 rounded-full bg-card/50">
                          <User className="size-3 text-primary shrink-0" />
                          <span className="font-bold tracking-tight text-[11px]">{property.owner?.name || "Unverified Identity"}</span>
                       </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs font-medium text-muted-foreground/80">
                      {format(new Date(property.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       {property.status === "PENDING" ? (
                         <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                            <Button 
                               size="sm"
                               onClick={() => approve(property.id)}
                               disabled={isMutating}
                               className="h-8 rounded-lg font-black text-[10px] px-3 flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                               <Check className="size-3" /> Approve
                            </Button>
                            <Button 
                               size="sm"
                               variant="outline"
                               onClick={() => reject(property.id)}
                               disabled={isMutating}
                               className="h-8 rounded-lg font-black text-[10px] border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 px-3 flex items-center gap-1.5"
                            >
                               <X className="size-3" /> Reject
                            </Button>
                         </div>
                       ) : (
                         <span className="text-[10px] font-black opacity-40">Processed</span>
                       )}
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
