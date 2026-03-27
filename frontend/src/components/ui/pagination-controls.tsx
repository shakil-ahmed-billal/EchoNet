"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ meta, onPageChange, className = "" }: PaginationProps) {
  const { page, totalPages, total, limit } = meta

  if (totalPages <= 1) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  // Generate page numbers to show (max 5 visible)
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)

    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      <p className="text-xs text-muted-foreground font-medium">
        Showing <span className="font-bold text-foreground">{from}–{to}</span> of{" "}
        <span className="font-bold text-foreground">{total}</span> results
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-lg"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-lg"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {pages[0] > 1 && (
          <>
            <Button variant="outline" size="icon-sm" className="rounded-lg" onClick={() => onPageChange(1)}>1</Button>
            {pages[0] > 2 && <span className="text-muted-foreground text-xs px-1">…</span>}
          </>
        )}

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon-sm"
            className="rounded-lg text-xs font-bold"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="text-muted-foreground text-xs px-1">…</span>
            )}
            <Button variant="outline" size="icon-sm" className="rounded-lg" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-lg"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-lg"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
