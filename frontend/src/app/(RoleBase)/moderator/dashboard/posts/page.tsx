"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Trash2, CheckCircle, ExternalLink, Search } from "lucide-react"
import { useFlaggedPosts, useDeletePost } from "@/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination-controls"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { UserImage } from "@/components/user-image"
import * as AdminService from "@/services/admin.service"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function ModeratorPostsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useFlaggedPosts({ page, limit: 12, searchTerm: search || undefined })
  const { mutate: deletePost } = useDeletePost()
  const queryClient = useQueryClient()

  const posts: any[] = data?.data ?? (Array.isArray(data) ? data : [])
  const meta = data?.meta

  const approvePost = async (id: string) => {
    try {
      await AdminService.updatePostStatus(id, "ACTIVE")
      queryClient.invalidateQueries({ queryKey: ['flagged-posts'] })
      toast.success("Post approved")
    } catch {
      toast.error("Failed to approve post")
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Posts Moderation</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review and manage flagged community posts.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts or authors..."
              className="pl-9 rounded-xl border-border/40"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          {meta?.total != null && meta.total > 0 && (
            <Badge className="rounded-full bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-black px-3 shrink-0">
              {meta.total} flagged
            </Badge>
          )}
        </div>
      </div>

      {!isLoading && posts.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-border/30 rounded-2xl text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-bold">No flagged posts</p>
          <p className="text-xs mt-1">All community posts are within guidelines.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="rounded-2xl border border-border/40 p-0">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3"><Skeleton className="h-9 w-9 rounded-full" /><div><Skeleton className="h-3 w-28 mb-1" /><Skeleton className="h-3 w-20" /></div></div>
                    <Skeleton className="h-12 w-full mb-3" />
                    <div className="flex gap-2"><Skeleton className="h-8 w-28" /><Skeleton className="h-8 w-28" /></div>
                  </CardContent>
                </Card>
              ))
            : posts.map((post) => (
                <Card key={post.id} className="rounded-2xl border border-amber-500/20 hover:border-amber-500/40 shadow-sm transition-all p-0 bg-card">
                  <CardContent className="p-5">
                    {/* Author */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <UserImage user={{ avatarUrl: post.author?.avatarUrl, name: post.author?.name }} className="h-9 w-9 rounded-full" />
                        <div>
                          <p className="text-sm font-bold">{post.author?.name}</p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(post.createdAt), "MMM d, yyyy · h:mm a")}</p>
                        </div>
                      </div>
                      <Badge className="rounded-full text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20">Flagged</Badge>
                    </div>

                    {/* Content */}
                    {post.content && (
                      <p className="text-sm text-muted-foreground bg-muted/20 rounded-xl px-4 py-3 mb-3 line-clamp-3">
                        {post.content}
                      </p>
                    )}

                    {/* Media preview */}
                    {post.mediaUrls?.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                        {post.mediaUrls.slice(0, 4).map((url: string, i: number) => (
                          <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                            <Image src={url} alt="" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-border/30">
                      <Link href={`/feed?post=${post.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1 h-8">
                          <ExternalLink className="h-3 w-3" /> View Post
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="rounded-xl text-xs gap-1 h-8 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => approvePost(post.id)}
                      >
                        <CheckCircle className="h-3 w-3" /> Keep Post
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs gap-1 h-8 text-red-500 border-red-500/30 hover:bg-red-500/10 ml-auto"
                        onClick={() => deletePost(post.id)}
                      >
                        <Trash2 className="h-3 w-3" /> Delete Post
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
