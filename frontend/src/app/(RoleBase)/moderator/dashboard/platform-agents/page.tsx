"use client"

import { useState } from "react"
import { useAdminAgents, useVerifyAgent } from "@/hooks/use-admin"
import { apiClient } from "@/services/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, ShieldCheck, ShieldAlert, UserCheck } from "lucide-react"
import { Pagination } from "@/components/ui/pagination-controls"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const useRejectAgent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/agents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] })
      toast.success("Agent rejected and profile removed")
    },
    onError: () => toast.error("Failed to reject agent"),
  })
}

export default function ModeratorAgentsPage() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState("false")

  const { data: response, isLoading } = useAdminAgents({ page, limit: 10, isVerified: filter })
  const { mutate: verify, isPending: isVerifying } = useVerifyAgent()
  const { mutate: reject, isPending: isRejecting } = useRejectAgent()

  const agents = response?.data || []
  const meta = response?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Agent Verification</h1>
          <p className="text-sm text-muted-foreground font-medium">Verify or reject real estate agent credentials.</p>
        </div>
        <Select value={filter} onValueChange={(v) => { setFilter(v || "false"); setPage(1) }}>
          <SelectTrigger className="w-[170px] h-9 rounded-xl border-border/40 text-xs font-bold">
            <SelectValue placeholder="Filter agents" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="false">Pending Verification</SelectItem>
            <SelectItem value="true">Verified Agents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-border/10 hover:bg-transparent">
                  <TableHead className="font-bold text-xs pl-6 py-4">Agent</TableHead>
                  <TableHead className="font-bold text-xs">License / Agency</TableHead>
                  <TableHead className="font-bold text-xs hidden md:table-cell">Experience</TableHead>
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
                        Loading agent profiles...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/60">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck className="size-8 opacity-40 mb-2" />
                        No {filter === "true" ? "verified" : "pending"} agents found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  agents.map((agent: any) => (
                    <TableRow key={agent.id} className="border-border/10 hover:bg-muted/5 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10 rounded-xl border border-border/20 shadow-sm">
                            <AvatarImage src={agent.user?.avatarUrl || agent.user?.image} className="object-cover" />
                            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-[10px]">
                              {agent.user?.name?.[0]?.toUpperCase() || agent.name?.[0]?.toUpperCase() || "A"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs tracking-tight truncate text-foreground">{agent.user?.name || agent.name}</span>
                            <span className="text-[10px] font-bold text-muted-foreground truncate">{agent.user?.email || agent.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{agent.licenseNumber || "—"}</span>
                          <span className="text-[10px] text-muted-foreground">{agent.agency || "Independent"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs font-medium text-muted-foreground">
                        {agent.yearsOfExperience ? `${agent.yearsOfExperience} yrs` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-full font-bold text-[10px] tracking-wider px-3 py-0.5 ${
                          agent.isVerified
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}>
                          {agent.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          {!agent.isVerified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => verify(agent.id)}
                              disabled={isVerifying}
                              className="h-8 rounded-lg font-bold text-[10px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                            >
                              <ShieldCheck className="size-3 mr-1" /> Verify
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => reject(agent.id)}
                            disabled={isRejecting}
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
