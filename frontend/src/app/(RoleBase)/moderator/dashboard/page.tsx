"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flag, FileText, ShieldCheck, AlertTriangle } from "lucide-react"
import { useFlaggedProducts, useFlaggedPosts } from "@/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

function QueueCard({ title, count, sub, icon: Icon, href, urgent, isLoading }: any) {
  return (
    <Link href={href}>
      <Card className={`rounded-2xl border transition-all hover:shadow-md cursor-pointer p-0 ${urgent && count > 0 ? "border-red-500/30 hover:border-red-500/50 bg-red-500/5" : "border-border/40 hover:border-border/70"}`}>
        <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${urgent && count > 0 ? "bg-red-500/10" : "bg-muted/50"}`}>
              <Icon className={`h-4 w-4 ${urgent && count > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            </div>
            <CardTitle className="text-sm font-bold">{title}</CardTitle>
          </div>
          {isLoading ? <Skeleton className="h-7 w-12 rounded-full" /> : (
            <span className={`text-xl font-black ${urgent && count > 0 ? "text-red-500" : "text-foreground"}`}>{count ?? 0}</span>
          )}
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <p className="text-xs text-muted-foreground">{sub}</p>
          <Button size="sm" variant="outline" className="mt-3 rounded-xl text-xs w-full">
            Review Queue →
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ModeratorDashboard() {
  const { data: flaggedProductsData, isLoading: loadingProducts } = useFlaggedProducts()
  const { data: flaggedPostsData, isLoading: loadingPosts } = useFlaggedPosts()

  const flaggedCount = Array.isArray(flaggedProductsData) ? flaggedProductsData.length : (flaggedProductsData?.data?.length ?? 0)
  const postsCount = Array.isArray(flaggedPostsData) ? flaggedPostsData.length : (flaggedPostsData?.data?.length ?? 0)

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Moderator Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">Review flagged content and manage community posts.</p>
      </div>

      {/* Alert Banner */}
      {(flaggedCount + postsCount) > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-600">Action Required</p>
            <p className="text-xs text-muted-foreground">{flaggedCount + postsCount} items need your immediate review.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <QueueCard
          title="Flagged Products"
          count={flaggedCount}
          sub="Products reported by community members requiring review."
          icon={Flag}
          href="/moderator/dashboard/products"
          urgent
          isLoading={loadingProducts}
        />
        <QueueCard
          title="Posts Moderation"
          count={postsCount}
          sub="Posts flagged for inappropriate content or spam."
          icon={FileText}
          href="/moderator/dashboard/posts"
          urgent
          isLoading={loadingPosts}
        />
      </div>

      {/* Status */}
      <Card className="rounded-2xl border border-border/40 p-0">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="font-medium">All systems operational.</span>
            <span className="text-muted-foreground text-xs ml-auto">EchoNet Moderation</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
