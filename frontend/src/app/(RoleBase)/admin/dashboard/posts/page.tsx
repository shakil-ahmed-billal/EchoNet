"use client"

import { useState } from "react"
import { useAdminPosts, useDeletePost, useUpdatePostStatus } from "@/hooks/use-admin"
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
import { ShieldCheck, Trash2, ShieldAlert, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination-controls"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminPostsPage() {
  const [page, setPage] = useState(1)
  
  const { data: response, isLoading } = useAdminPosts({
    page,
    limit: 8,
  })

  const { mutate: deletePost, isPending: isDeleting } = useDeletePost()
  const { mutate: updateStatus, isPending: isUpdating } = useUpdatePostStatus()

  const posts = response?.data || []
  const meta = response?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }

  const onMarkSafe = (id: string) => {
    updateStatus({ id, status: "PUBLISHED" })
  }

  const onDelete = (id: string) => {
    deletePost(id)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Content Moderation</h1>
          <p className="text-sm text-muted-foreground font-medium">Review community reports and flagged network posts.</p>
        </div>
      </div>

      <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/10">
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="font-bold text-xs pl-6 py-4 w-[250px]">Author</TableHead>
                <TableHead className="font-bold text-xs">Content Snippet</TableHead>
                <TableHead className="font-bold text-xs w-[120px]">Status</TableHead>
                <TableHead className="font-bold text-xs hidden md:table-cell">Reported</TableHead>
                <TableHead className="font-bold text-xs text-right pr-6 w-[180px]">Intervention</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/50">
                    <div className="flex flex-col items-center gap-2">
                       <ShieldAlert className="size-6 animate-pulse text-muted-foreground/30" />
                       Scanning content network...
                    </div>
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/60">
                    <div className="flex flex-col items-center gap-2">
                       <MessageSquare className="size-8 opacity-40 mb-2" />
                       No posts available in the network.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post: any) => (
                  <TableRow key={post.id} className="border-border/10 hover:bg-muted/5 transition-colors group">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 rounded-xl border border-border/20 shadow-sm">
                          <AvatarImage src={post.author?.avatarUrl || post.author?.image} className="object-cover" />
                          <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-[10px]">
                            {post.author?.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs tracking-tight truncate text-foreground">{post.author?.name}</span>
                          <span className="text-[10px] font-bold text-muted-foreground truncate">{post.author?.role}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs font-medium text-muted-foreground/80">
                       <div className="flex items-center gap-2">
                          <MessageSquare className="size-3 opacity-50 shrink-0" />
                          <span className="truncate">{post.content || "Media-only post..."}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="destructive"
                        className="rounded-full font-bold text-[10px] tracking-wider px-3 py-0.5 bg-rose-500/10 text-rose-600 border-rose-500/20"
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-medium text-muted-foreground/80">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <Button 
                             size="sm"
                             variant="outline"
                             onClick={() => onMarkSafe(post.id)}
                             disabled={isUpdating}
                             className="h-8 rounded-lg font-bold text-[10px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                          >
                             Clear Flag
                          </Button>
                          <Button 
                             size="icon"
                             variant="destructive"
                             onClick={() => onDelete(post.id)}
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
