"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Home, Flag, BarChart3, ShieldCheck, Package, TrendingUp, Clock } from "lucide-react"
import { useAdminStats } from "@/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

function StatCard({ title, value, sub, icon: Icon, href, iconColor = "text-muted-foreground" }: any) {
  const inner = (
    <Card className="rounded-2xl border border-border/40 shadow-sm hover:shadow-md hover:border-border/70 transition-all bg-card p-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-5 pt-5">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="text-3xl font-black tracking-tight">{value ?? <Skeleton className="h-8 w-20" />}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1 font-medium">{sub}</p>}
      </CardContent>
    </Card>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default function AdminDashboardOverview() {
  const { data: stats, isLoading } = useAdminStats()

  const cards = [
    {
      title: "Total Users",
      value: isLoading ? null : stats?.users?.total?.toLocaleString(),
      sub: "Registered accounts",
      icon: Users,
      href: "/admin/dashboard/users",
      iconColor: "text-blue-500",
    },
    {
      title: "Total Properties",
      value: isLoading ? null : stats?.properties?.total?.toLocaleString(),
      sub: `${stats?.properties?.pending ?? 0} pending review`,
      icon: Home,
      href: "/admin/dashboard/properties",
      iconColor: "text-emerald-500",
    },
    {
      title: "Flagged Products",
      value: isLoading ? null : stats?.products?.flagged?.toLocaleString(),
      sub: stats?.products?.flagged > 0 ? "Requires immediate review" : "No flags pending",
      icon: Flag,
      href: "/admin/dashboard/products",
      iconColor: stats?.products?.flagged > 0 ? "text-red-500" : "text-muted-foreground",
    },
    {
      title: "Total Products",
      value: isLoading ? null : stats?.products?.total?.toLocaleString(),
      sub: "In marketplace",
      icon: Package,
      iconColor: "text-purple-500",
    },
    {
      title: "Total Orders",
      value: isLoading ? null : stats?.orders?.total?.toLocaleString(),
      sub: `৳${Number(stats?.orders?.totalRevenue ?? 0).toLocaleString()} revenue`,
      icon: TrendingUp,
      iconColor: "text-amber-500",
    },
    {
      title: "Verified Agents",
      value: isLoading ? null : stats?.agents?.total?.toLocaleString(),
      sub: "Active real estate agents",
      icon: ShieldCheck,
      href: "/admin/dashboard/agents",
      iconColor: "text-teal-500",
    },
  ]

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">Platform analytics and management dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pending Properties", href: "/admin/dashboard/properties", icon: Clock, badge: stats?.properties?.pending },
            { label: "Manage Users", href: "/admin/dashboard/users", icon: Users },
            { label: "Flagged Products", href: "/admin/dashboard/products", icon: Flag, badge: stats?.products?.flagged },
            { label: "Verify Agents", href: "/admin/dashboard/agents", icon: ShieldCheck },
          ].map(({ label, href, icon: Icon, badge }) => (
            <Link key={label} href={href}>
              <div className="relative rounded-2xl border border-border/40 bg-card hover:bg-muted/30 p-4 flex flex-col gap-2 transition-all hover:border-border/70 cursor-pointer">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-bold">{label}</span>
                {badge != null && badge > 0 && (
                  <span className="absolute top-3 right-3 text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
