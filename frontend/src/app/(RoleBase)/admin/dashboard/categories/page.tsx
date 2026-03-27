"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Tag, Plus, Pencil, Trash2, Search } from "lucide-react"
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import { useForm } from "react-hook-form"
import { Pagination } from "@/components/ui/pagination-controls"

function CategoryDialog({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: any }) {
  const { mutate: create, isPending: creating } = useCreateCategory()
  const { mutate: update, isPending: updating } = useUpdateCategory()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initial ?? { name: "", slug: "", description: "" }
  })

  const isPending = creating || updating

  const onSubmit = (values: any) => {
    if (initial) {
      update({ id: initial.id, payload: values }, { onSuccess: () => { reset(); onClose() } })
    } else {
      // Auto-generate slug from name
      values.slug = values.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      create(values, { onSuccess: () => { reset(); onClose() } })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black">{initial ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider">Name</Label>
            <Input {...register("name", { required: true })} placeholder="e.g. Electronics" className="mt-1.5 rounded-xl border-border/50" />
            {errors.name && <p className="text-[10px] text-red-500 mt-1">Name is required</p>}
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider">Description</Label>
            <Textarea {...register("description")} placeholder="Short description..." className="mt-1.5 rounded-xl border-border/50 resize-none" rows={3} />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="rounded-xl" disabled={isPending}>
              {isPending ? "Saving..." : initial ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminCategories({ searchTerm: search || undefined, page, limit: 12 })
  const { mutate: deleteCategory } = useDeleteCategory()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const list: any[] = data?.data ?? (Array.isArray(data) ? data : [])
  const meta = data?.meta

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage marketplace and property categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-9 rounded-xl border-border/40"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }} className="rounded-xl gap-2 shrink-0">
            <Plus className="h-4 w-4" /> New Category
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl border border-border/40 p-0">
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))
          : list.map((cat) => (
              <Card key={cat.id} className="rounded-2xl border border-border/40 hover:border-border/70 shadow-sm transition-all p-0 bg-card">
                <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{cat.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => { setEditing(cat); setDialogOpen(true) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => setDeleteTarget(cat)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className="text-xs text-muted-foreground line-clamp-2">{cat.description || "No description provided."}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {cat._count?.products != null && (
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{cat._count.products} Products</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && list.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold">No categories found.</p>
        </div>
      )}

      {meta && (
        <Pagination
          meta={{ ...meta, totalPages: meta.totalPages ?? Math.ceil(meta.total / 12) }}
          onPageChange={setPage}
        />
      )}

      <CategoryDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        initial={editing}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>. Products in this category may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-500 hover:bg-red-600"
              onClick={() => { deleteCategory(deleteTarget.id); setDeleteTarget(null) }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
