"use client"

import { useState } from "react"
import { useAdminStories, useDeleteStory } from "@/hooks/use-admin"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Clapperboard, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/ui/pagination-controls"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminStoriesPage() {
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; author: string } | null>(null)

  const { data: response, isLoading } = useAdminStories({ page, limit: 8 })
  const { mutate: deleteStory, isPending: isDeleting } = useDeleteStory()

  const stories = response?.data || []
  const meta = response?.meta || { total: 0, page: 1, limit: 8, totalPages: 1 }

  const onConfirmDelete = () => {
    if (!deleteTarget) return
    deleteStory(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Stories Audit</h1>
          <p className="text-sm text-muted-foreground font-medium">Review and monitor active 24-hr story distributions.</p>
        </div>
      </div>

      <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/10">
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="font-bold text-xs pl-6 py-4 w-[250px]">Author</TableHead>
                <TableHead className="font-bold text-xs">Type</TableHead>
                <TableHead className="font-bold text-xs hidden md:table-cell">Uploaded</TableHead>
                <TableHead className="font-bold text-xs">Expiring</TableHead>
                <TableHead className="font-bold text-xs text-right pr-6 w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/50">
                    <div className="flex flex-col items-center gap-2">
                       <ShieldAlert className="size-6 animate-pulse text-muted-foreground/30" />
                       Scanning story network...
                    </div>
                  </TableCell>
                </TableRow>
              ) : stories.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-40 text-center font-bold text-muted-foreground/60">
                    <div className="flex flex-col items-center gap-2">
                       <Clapperboard className="size-8 opacity-40 mb-2" />
                       No active stories detected in the network.
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
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs tracking-tight truncate text-foreground">{story.author?.name}</span>
                          <span className="text-[10px] font-bold text-muted-foreground truncate">{story.author?.role || "USER"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs font-medium text-muted-foreground/80">
                       <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px]">{story.mediaType || "IMAGE"}</span>
                       </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-medium text-muted-foreground/80">
                      {format(new Date(story.createdAt), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                       <span className="text-amber-500">
                          {format(new Date(story.expiresAt), "HH:mm")}
                       </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        onClick={() => setDeleteTarget({ id: story.id, author: story.author?.name || "Unknown" })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
                meta={{ page: meta.page || 1, totalPages: meta.totalPages || Math.ceil((meta.total || 0) / (meta.limit || 8)), total: meta.total || 0, limit: meta.limit || 8 }}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-red-500">Delete Story?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              This will permanently delete <span className="font-bold text-foreground">{deleteTarget?.author}</span>'s story
              and remove the media from Cloudinary. This action <span className="font-bold text-red-500">cannot be undone</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
              onClick={onConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Story"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
