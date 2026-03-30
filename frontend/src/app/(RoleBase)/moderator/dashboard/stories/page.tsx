"use client"

import { useState } from "react"
import { useAdminStories, useDeleteStory } from "@/hooks/use-admin"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Clapperboard, ShieldAlert } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination-controls"

export default function ModeratorStoriesPage() {
  const [page, setPage] = useState(1)
  const { data: response, isLoading } = useAdminStories({ page, limit: 10 })
  const { mutate: deleteStory, isPending: isDeleting } = useDeleteStory()

  const stories = response?.data || []
  const meta = response?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Stories Audit</h1>
        <p className="text-sm text-muted-foreground font-medium">Review and manage platform stories for policy compliance.</p>
      </div>

      <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-border/10 hover:bg-transparent">
                  <TableHead className="font-bold text-xs pl-6 py-4 w-[250px]">Author</TableHead>
                  <TableHead className="font-bold text-xs">Caption</TableHead>
                  <TableHead className="font-bold text-xs w-[120px]">Media</TableHead>
                  <TableHead className="font-bold text-xs hidden md:table-cell">Posted</TableHead>
                  <TableHead className="font-bold text-xs hidden md:table-cell">Expires</TableHead>
                  <TableHead className="font-bold text-xs text-right pr-6 w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center font-bold text-muted-foreground/50">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldAlert className="size-6 animate-pulse text-muted-foreground/30" />
                        Loading stories audit data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : stories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center font-bold text-muted-foreground/60">
                      <div className="flex flex-col items-center gap-2">
                        <Clapperboard className="size-8 opacity-40 mb-2" />
                        No stories found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  stories.map((story: any) => (
                    <TableRow key={story.id} className="border-border/10 hover:bg-muted/5 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 rounded-xl border border-border/20 shadow-sm">
                            <AvatarImage src={story.author?.avatarUrl || story.author?.image} className="object-cover" />
                            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-[10px]">
                              {story.author?.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-xs tracking-tight text-foreground">{story.author?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs text-xs font-medium text-muted-foreground/80">
                        <span className="truncate block">{story.caption || <span className="opacity-40 italic">No caption</span>}</span>
                      </TableCell>
                      <TableCell>
                        {story.mediaUrl ? (
                          <a href={story.mediaUrl} target="_blank" rel="noopener noreferrer">
                            <img src={story.mediaUrl} alt="story" className="h-10 w-16 object-cover rounded-lg border border-border/20 hover:opacity-80 transition-opacity" />
                          </a>
                        ) : <span className="text-xs text-muted-foreground/40">—</span>}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs font-medium text-muted-foreground/80">
                        {format(new Date(story.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs font-medium text-muted-foreground/80">
                        {story.expiresAt ? format(new Date(story.expiresAt), "MMM d, HH:mm") : "—"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteStory(story.id)}
                          disabled={isDeleting}
                          className="size-8 rounded-lg opacity-50 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
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
