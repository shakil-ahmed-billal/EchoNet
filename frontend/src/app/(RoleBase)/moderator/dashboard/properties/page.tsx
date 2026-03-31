"use client"

import { useState } from "react"
import { useAdminProperties, useApproveProperty, useRejectProperty } from "@/hooks/use-admin"
import { apiClient } from "@/services/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Home, ShieldAlert, Check, X, Eye, FileText, MapPin, Grid, User } from "lucide-react"
import { Pagination } from "@/components/ui/pagination-controls"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getOptimizedImageUrl } from "@/lib/image-utils"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const useDeleteProperty = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] })
      toast.success("Property deleted")
    },
    onError: () => toast.error("Failed to delete property"),
  })
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  SOLD: "bg-blue-500/10 text-blue-600 border-blue-500/20",
}

export default function ModeratorPropertiesPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("PENDING")

  const { data: response, isLoading } = useAdminProperties({ page, limit: 8, status })
  const { mutate: approve, isPending: isApproving } = useApproveProperty()
  const { mutate: reject, isPending: isRejecting } = useRejectProperty()
  const { mutate: deleteProperty, isPending: isDeleting } = useDeleteProperty()

  const properties = response?.data || []
  const meta = response?.meta || { total: 0, page: 1, limit: 8, totalPages: 1 }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Properties Management</h1>
          <p className="text-sm text-muted-foreground font-medium">Review, approve or reject property listings.</p>
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v || "PENDING"); setPage(1) }}>
          <SelectTrigger className="w-[160px] h-9 rounded-xl border-border/40 text-xs font-bold">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-border/10 hover:bg-transparent">
                  <TableHead className="font-bold text-xs pl-6 py-4">Property</TableHead>
                  <TableHead className="font-bold text-xs">Owner</TableHead>
                  <TableHead className="font-bold text-xs w-[100px]">Price</TableHead>
                  <TableHead className="font-bold text-xs w-[120px]">Status</TableHead>
                  <TableHead className="font-bold text-xs text-right pr-6 w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/50">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldAlert className="size-6 animate-pulse text-muted-foreground/30" />
                        Loading property data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : properties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/60">
                      <div className="flex flex-col items-center gap-2">
                        <Home className="size-8 opacity-40 mb-2" />
                        No {status.toLowerCase()} properties found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  properties.map((prop: any) => (
                    <TableRow key={prop.id} className="border-border/10 hover:bg-muted/5 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          {prop.images?.[0] ? (
                            <img src={getOptimizedImageUrl(prop.images[0], { width: 80, height: 80 })} alt={prop.title} className="size-11 rounded-xl object-cover border border-border/20" />
                          ) : (
                            <div className="size-11 rounded-xl bg-muted/30 flex items-center justify-center"><Home className="size-5 opacity-40" /></div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs truncate text-foreground">{prop.title}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{prop.location || prop.address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7 rounded-lg border border-border/20">
                            <AvatarImage src={prop.owner?.avatarUrl || prop.owner?.image} />
                            <AvatarFallback className="rounded-lg text-[10px] font-bold">{prop.owner?.name?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold text-foreground truncate">{prop.owner?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground">
                        ৳{prop.price?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-full font-bold text-[10px] tracking-wider px-3 py-0.5 ${statusColors[prop.status] || "bg-muted text-muted-foreground"}`}>
                          {prop.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <Dialog>
                            <DialogTrigger
                              render={
                                <Button size="icon" variant="outline" className="size-8 rounded-lg border-primary/20 hover:bg-primary/10 text-primary">
                                  <Eye className="size-4" />
                                </Button>
                              }
                            />
                            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden gap-0 rounded-2xl border-border/40">
                              <div className="h-48 md:h-64 bg-muted relative w-full">
                                {prop.images?.[0] ? (
                                  <img src={prop.images[0]} alt="" className="object-cover w-full h-full" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                                    <Home className="size-12 text-muted-foreground/30 mb-2" />
                                    <span className="text-sm font-semibold text-muted-foreground/60">No Media Attached</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-6 pr-6">
                                  <Badge className={`mb-2 text-[10px] tracking-wider font-bold rounded-lg px-2.5 py-1 text-white border-transparent ${
                                    prop.status === "PENDING" ? "bg-amber-500" :
                                    prop.status === "ACTIVE" || prop.status === "APPROVED" ? "bg-emerald-500" :
                                    prop.status === "REJECTED" ? "bg-rose-500" : "bg-blue-500"
                                  }`}>
                                    {prop.status}
                                  </Badge>
                                  <h2 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md">{prop.title}</h2>
                                  <div className="hidden sm:flex items-center gap-3 mt-2">
                                    <span className="flex items-center text-xs font-medium text-white/90 drop-shadow"><MapPin className="size-3.5 mr-1 text-primary drop-shadow-sm" /> {prop.location || prop.address}</span>
                                    <span className="text-white/40">•</span>
                                    <span className="flex items-center text-xs font-medium text-white/90 drop-shadow"><Grid className="size-3.5 mr-1 text-primary drop-shadow-sm" /> {prop.type || "Property"}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <ScrollArea className="max-h-[50vh]">
                                <div className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-6">
                                      <div>
                                        <h3 className="flex items-center text-sm font-black text-foreground uppercase tracking-wider mb-2">
                                          <FileText className="size-4 mr-2 text-primary" /> Listing Description
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{prop.description || "No description provided."}</p>
                                      </div>
                                      
                                      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card">
                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                          <User className="size-5" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Submitted By</span>
                                          <span className="font-bold text-foreground">{prop.owner?.name || "Unknown User"}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                                        <h3 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Asking Price</h3>
                                        <p className="text-2xl font-black text-primary tracking-tight mt-1">৳{prop.price?.toLocaleString()}</p>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 bg-muted/50 rounded-xl border border-border/40 flex flex-col">
                                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Beds</span>
                                          <span className="font-bold">{prop.beds || "-"}</span>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-xl border border-border/40 flex flex-col">
                                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Baths</span>
                                          <span className="font-bold">{prop.baths || "-"}</span>
                                        </div>
                                        <div className="col-span-2 p-3 bg-muted/50 rounded-xl border border-border/40 flex flex-col">
                                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Area</span>
                                          <span className="font-bold">{prop.area || "-"} sq ft</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approve(prop.id)}
                            disabled={isApproving || prop.status === "ACTIVE" || prop.status === "APPROVED"}
                            className="h-8 rounded-lg font-bold text-[10px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                          >
                            <Check className="size-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reject(prop.id)}
                            disabled={isRejecting || prop.status === "REJECTED"}
                            className="h-8 rounded-lg font-bold text-[10px] border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                          >
                            <X className="size-3 mr-1" /> Reject
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => deleteProperty(prop.id)}
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
