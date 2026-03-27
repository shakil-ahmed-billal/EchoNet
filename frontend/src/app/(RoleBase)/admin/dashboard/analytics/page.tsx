"use client"

import { useAdminStats } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Home, Package, TrendingUp, ShoppingCart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

function MetricRow({ label, value, isLoading }: { label: string; value: any; isLoading: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      {isLoading ? <Skeleton className="h-4 w-16" /> : <span className="text-sm font-black">{value}</span>}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useAdminStats()

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Platform-wide performance metrics and statistics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Users */}
        <Card className="rounded-2xl border border-border/40 shadow-sm p-0">
          <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-sm font-bold">User Statistics</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <MetricRow label="Total Users" value={stats?.users?.total?.toLocaleString()} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Properties */}
        <Card className="rounded-2xl border border-border/40 shadow-sm p-0">
          <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Home className="h-4 w-4 text-emerald-500" />
            </div>
            <CardTitle className="text-sm font-bold">Property Statistics</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <MetricRow label="Total Listings" value={stats?.properties?.total?.toLocaleString()} isLoading={isLoading} />
            <MetricRow label="Pending Approval" value={stats?.properties?.pending?.toLocaleString()} isLoading={isLoading} />
            <MetricRow label="Active Agents" value={stats?.agents?.total?.toLocaleString()} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Marketplace */}
        <Card className="rounded-2xl border border-border/40 shadow-sm p-0">
          <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-purple-500" />
            </div>
            <CardTitle className="text-sm font-bold">Marketplace Statistics</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <MetricRow label="Total Products" value={stats?.products?.total?.toLocaleString()} isLoading={isLoading} />
            <MetricRow label="Flagged Products" value={stats?.products?.flagged?.toLocaleString()} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="rounded-2xl border border-border/40 shadow-sm p-0 md:col-span-2 xl:col-span-3">
          <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-sm font-bold">Revenue & Orders</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/20 rounded-2xl">
                <p className="text-xs text-muted-foreground font-medium mb-1">Total Orders</p>
                {isLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : <p className="text-2xl font-black">{stats?.orders?.total?.toLocaleString()}</p>}
              </div>
              <div className="text-center p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <p className="text-xs text-muted-foreground font-medium mb-1">Total Revenue</p>
                {isLoading ? <Skeleton className="h-8 w-24 mx-auto" /> : (
                  <p className="text-2xl font-black text-emerald-600">৳{Number(stats?.orders?.totalRevenue ?? 0).toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
