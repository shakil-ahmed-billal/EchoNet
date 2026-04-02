"use client"

import { useState } from "react"
import { useAdminPosts, useDeletePost, useUpdatePostStatus } from "@/hooks/use-admin"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Trash2, ShieldAlert, MessageSquare, CheckSquare } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination-controls"

export default function ModeratorPostsPage() {
  const [page, setPage] = useState(1)
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const { data: response, isLoading } = useAdminPosts({ page, limit: 8 })
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost()
  const { mutate: updateStatus, isPending: isUpdating } = useUpdatePostStatus()

  const posts = response?.data || []
  const meta = response?.meta || { total: 0, page: 1, limit: 8, totalPages: 1 }

  const toggleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(posts.map((p: any) => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPosts(newSelected)
  }

  const handleBulkApprove = () => {
    selectedPosts.forEach(id => {
      updateStatus({ id, status: "ACTIVE" })
    })
    setSelectedPosts(new Set())
  }

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedPosts.size} posts?`)) {
      selectedPosts.forEach(id => {
        deletePost(id)
      })
      setSelectedPosts(new Set())
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Posts Moderation</h1>
          <p className="text-sm text-muted-foreground font-medium">Review community reports and flagged network posts.</p>
        </div>
        
        {selectedPosts.size > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Badge variant="secondary" className="mr-2">{selectedPosts.size} selected</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkApprove}
              disabled={isUpdating}
              className="h-9 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
            >
              <CheckSquare className="size-4 mr-2" /> Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="h-9"
            >
              <Trash2 className="size-4 mr-2" /> Delete
            </Button>
          </div>
        )}
      </div>

      <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-border/10 hover:bg-transparent">
                  <TableHead className="w-[40px] pl-6 py-4">
                    <input type="checkbox"
                      checked={posts.length > 0 && selectedPosts.size === posts.length}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-bold text-xs w-[250px]">Author</TableHead>
                  <TableHead className="font-bold text-xs">Content Snippet</TableHead>
                  <TableHead className="font-bold text-xs w-[120px]">Status</TableHead>
                  <TableHead className="font-bold text-xs hidden md:table-cell">Date</TableHead>
                  <TableHead className="font-bold text-xs text-right pr-6 w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center font-bold text-muted-foreground/50">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldAlert className="size-6 animate-pulse text-muted-foreground/30" />
                        Scanning content network...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center font-bold text-muted-foreground/60">
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="size-8 opacity-40 mb-2" />
                        No posts found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post: any) => (
                    <TableRow key={post.id} className="border-border/10 hover:bg-muted/5 transition-colors group">
                      <TableCell className="pl-6">
                        <input type="checkbox"
                          checked={selectedPosts.has(post.id)}
                          onChange={() => toggleSelect(post.id)}
                        />
                      </TableCell>
                      <TableCell className="py-4">
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
                        <Badge className={`rounded-full font-bold text-[10px] tracking-wider px-3 py-0.5 ${
                          post.status === "FLAGGED"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs font-medium text-muted-foreground/80">
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          {post.status === "ACTIVE" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus({ id: post.id, status: "FLAGGED" })}
                              disabled={isUpdating}
                              className="h-8 rounded-lg font-bold text-[10px] border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                            >
                              <ShieldAlert className="size-3 mr-1" /> Flag
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus({ id: post.id, status: "ACTIVE" })}
                              disabled={isUpdating}
                              className="h-8 rounded-lg font-bold text-[10px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                            >
                              <ShieldCheck className="size-3 mr-1" /> Approve
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to permanently delete this post?")) {
                                deletePost(post.id)
                              }
                            }}
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
