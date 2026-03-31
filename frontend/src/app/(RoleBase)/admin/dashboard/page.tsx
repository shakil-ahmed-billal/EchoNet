"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Home, 
  Flag, 
  ShieldCheck, 
  Package, 
  TrendingUp, 
  Clock, 
  MessageSquare,
  ArrowUpRight,
  TrendingDown,
  Activity
} from "lucide-react"
import { useAdminStats } from "@/hooks/use-admin"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { cn } from "@/lib/utils"

function StatCard({ title, value, sub, icon: Icon, href, iconColor = "text-muted-foreground", trend }: any) {
  const inner = (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl transition-all duration-500 hover:shadow-lg hover:border-primary/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-700 pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
        <CardTitle className="text-sm font-bold text-muted-foreground/70">{title}</CardTitle>
        <div className={cn(
          "h-10 w-10 rounded-2xl bg-muted/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner",
          iconColor
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {value ?? <Skeleton className="h-10 w-24 bg-muted/20 rounded-lg" />}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full",
              trend > 0 ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
            )}>
              {trend > 0 ? <ArrowUpRight className="size-3" /> : <TrendingDown className="size-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        {sub && <p className="text-xs font-medium text-muted-foreground mt-2 flex items-center gap-1.5">
          <Activity className="size-3 opacity-50" /> {sub}
        </p>}
      </CardContent>
    </Card>
  )
  return href ? <Link href={href} className="block">{inner}</Link> : inner
}

export default function AdminDashboardOverview() {
  const { data: statsData, isLoading } = useAdminStats()
  const stats = statsData?.data || statsData; // Handle both direct and wrapper response

  const cards = [
    {
      title: "Active Community",
      value: isLoading ? null : stats?.users?.total?.toLocaleString(),
      sub: "Total registered users",
      icon: Users,
      href: "/admin/dashboard/users",
      iconColor: "text-blue-500",
      trend: 12
    },
    {
      title: "Real Estate Hub",
      value: isLoading ? null : stats?.properties?.total?.toLocaleString(),
      sub: `${stats?.properties?.pending ?? 0} Pending approvals`,
      icon: Home,
      href: "/admin/dashboard/properties",
      iconColor: "text-emerald-500",
      trend: 8
    },
    {
      title: "Global Commerce",
      value: isLoading ? null : stats?.products?.total?.toLocaleString(),
      sub: `${stats?.products?.flagged ?? 0} Flagged items`,
      icon: Package,
      href: "/admin/dashboard/products",
      iconColor: "text-purple-500",
    },
    {
      title: "Revenue Operations",
      value: isLoading ? null : `৳${Number(stats?.orders?.totalRevenue ?? 0).toLocaleString()}`,
      sub: `${stats?.orders?.total ?? 0} Total orders processed`,
      icon: TrendingUp,
      iconColor: "text-amber-500",
      trend: 24
    },
    {
      title: "Content Moderation",
      value: isLoading ? null : stats?.posts?.flagged?.toLocaleString(),
      sub: stats?.posts?.flagged > 0 ? "Action required on reports" : "System clean",
      icon: Flag,
      href: "/admin/dashboard/posts",
      iconColor: stats?.posts?.flagged > 0 ? "text-rose-500" : "text-muted-foreground/40",
    },
    {
      title: "Verified Identity",
      value: isLoading ? null : stats?.agents?.total?.toLocaleString(),
      sub: "Verified platform agents",
      icon: ShieldCheck,
      href: "/admin/dashboard/platform-agents",
      iconColor: "text-cyan-500",
    },
  ]

  return (
    <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="text-primary italic">Admin.</span>
          </h1>
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Core Systems Operational — Live Analytics Active
          </div>

        </div>
        
        <div className="flex items-center gap-4 bg-muted/20 backdrop-blur-md p-1.5 rounded-2xl border border-border/10 shadow-inner">
           <button className="px-5 h-10 rounded-xl bg-card text-foreground text-xs font-black shadow-sm hover:bg-muted/50 transition-all border border-border/5">Last 24h</button>
           <button className="px-5 h-10 rounded-xl text-muted-foreground/40 text-xs font-black hover:text-foreground transition-all">Last 7d</button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Management Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-lg font-bold text-muted-foreground/70">Priority Management Units</h2>
           <div className="h-px flex-1 bg-border/10 ml-6" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Identity Audit", desc: "User Accounts & Verification", href: "/admin/dashboard/users", icon: Users },
            { label: "Content Control", desc: "Posts & Reported Media", href: "/admin/dashboard/posts", icon: MessageSquare, badge: stats?.posts?.flagged },
            { label: "Market Safety", desc: "Products & Store Integrity", href: "/admin/dashboard/products", icon: Package, badge: stats?.products?.flagged },
            { label: "Estate Review", desc: "Properties & Agent Status", href: "/admin/dashboard/properties", icon: Home, badge: stats?.properties?.pending },
          ].map(({ label, desc, href, icon: Icon, badge }) => (
            <Link key={label} href={href}>
              <div className="group relative rounded-2xl border border-border/20 bg-card/60 hover:bg-muted/10 p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500" />
                
                <div className="size-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-inner">
                   <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex flex-col gap-1">
                   <span className="text-base font-bold tracking-tight">{label}</span>
                   <span className="text-xs font-medium text-muted-foreground">{desc}</span>
                </div>

                {badge != null && badge > 0 && (
                  <div className="absolute top-6 right-6 flex items-center justify-center size-6 bg-rose-500 text-white text-[10px] font-black rounded-xl shadow-lg shadow-rose-500/20 animate-bounce">
                    {badge}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
