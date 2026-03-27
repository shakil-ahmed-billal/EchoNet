"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, ShieldAlert, ShieldCheck, UserX } from "lucide-react"
import { useAdminUsers, useUpdateUserRole, useSuspendUser } from "@/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { UserImage } from "@/components/user-image"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination-controls"

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
  MODERATOR: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  USER: "bg-muted text-muted-foreground border-border/40",
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminUsers({ searchTerm: search || undefined, page, limit: 12 })
  const { mutate: updateRole } = useUpdateUserRole()
  const { mutate: suspend } = useSuspendUser()

  const usersList: any[] = data?.data ?? (Array.isArray(data) ? data : [])
  const meta = data?.meta

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Users & Roles</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage roles and suspend EchoNet accounts.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 rounded-xl border-border/40"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      <Card className="rounded-2xl border border-border/40 shadow-sm overflow-hidden p-0">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase bg-muted/30 text-muted-foreground font-bold border-b border-border/40">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><div><Skeleton className="h-3 w-28 mb-1" /><Skeleton className="h-3 w-36" /></div></div></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-3 w-24" /></td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    ))
                  : usersList.map((user: any) => (
                      <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <UserImage user={{ avatarUrl: user.avatarUrl || user.image, name: user.name }} className="h-9 w-9 rounded-full" />
                            <div>
                              <p className="font-bold text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-wider rounded-full border ${ROLE_COLORS[user.role] ?? ROLE_COLORS.USER}`}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-3">
                          {user.isSuspended ? (
                            <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                              <ShieldAlert className="w-3.5 h-3.5" /> Suspended
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                              <ShieldCheck className="w-3.5 h-3.5" /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-xs text-muted-foreground font-medium">
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild={true}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl">
                              <DropdownMenuItem className="text-xs" onClick={() => updateRole({ id: user.id, role: "ADMIN" })}>Make Admin</DropdownMenuItem>
                              <DropdownMenuItem className="text-xs" onClick={() => updateRole({ id: user.id, role: "MODERATOR" })}>Make Moderator</DropdownMenuItem>
                              <DropdownMenuItem className="text-xs" onClick={() => updateRole({ id: user.id, role: "USER" })}>Reset to User</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs text-red-500 focus:text-red-500" onClick={() => suspend(user.id)} disabled={user.isSuspended}>
                                <UserX className="mr-2 h-3.5 w-3.5" /> Suspend Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {meta && (
        <Pagination
          meta={{ ...meta, totalPages: meta.totalPages ?? Math.ceil(meta.total / (meta.limit || 12)) }}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
