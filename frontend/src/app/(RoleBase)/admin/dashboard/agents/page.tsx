"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, MapPin, Phone, BadgeCheck, Clock } from "lucide-react"
import { useAdminAgents, useVerifyAgent } from "@/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { UserImage } from "@/components/user-image"
import { Pagination } from "@/components/ui/pagination-controls"
import { format } from "date-fns"

export default function AdminAgentsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminAgents({ page, limit: 12 })
  const { mutate: verify, isPending } = useVerifyAgent()

  const agents: any[] = data?.data ?? (Array.isArray(data) ? data : [])
  const meta = data?.meta

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Agents</h1>
        <p className="text-muted-foreground mt-1 text-sm">Review and verify real estate agent profiles.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl border border-border/40 p-0">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-3 w-20" /></div>
                  </div>
                  <Skeleton className="h-8 w-full rounded-xl" />
                </CardContent>
              </Card>
            ))
          : agents.map((agent) => (
              <Card key={agent.id} className="rounded-2xl border border-border/40 hover:border-border/70 shadow-sm transition-all p-0 bg-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <UserImage user={{ avatarUrl: agent.user?.avatarUrl, name: agent.user?.name }} className="h-11 w-11 rounded-full" />
                      <div>
                        <p className="font-bold text-sm">{agent.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.user?.email}</p>
                      </div>
                    </div>
                    {agent.isVerified ? (
                      <Badge className="rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 gap-1">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full text-[10px] font-black text-amber-600 border-amber-500/20 gap-1">
                        <Clock className="h-3 w-3" /> Pending
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1.5 mb-4">
                    {agent.agencyName && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-medium">{agent.agencyName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-mono">{agent.licenseNo}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
                      <span><span className="font-bold text-foreground">{agent.totalListings ?? 0}</span> Listings</span>
                      <span><span className="font-bold text-foreground">{agent.totalSales ?? 0}</span> Sales</span>
                      <span className="ml-auto">{format(new Date(agent.createdAt), "MMM yyyy")}</span>
                    </div>
                  </div>
                  {!agent.isVerified && (
                    <Button
                      size="sm"
                      className="w-full rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-xs"
                      onClick={() => verify(agent.id)}
                      disabled={isPending}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Verify Agent
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && agents.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold">No agents found.</p>
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
