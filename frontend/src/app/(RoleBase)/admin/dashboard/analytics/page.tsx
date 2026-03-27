"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Activity, Percent } from "lucide-react"

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into EchoNet's growth, revenue, and engagement.</p>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
           { title: "Total Revenue", value: "$45,231.89", trend: "+20.1%", icon: <DollarSign className="w-4 h-4" />, color: "text-green-500" },
           { title: "Active Subscriptions", value: "+2350", trend: "+180.1%", icon: <Users className="w-4 h-4" />, color: "text-blue-500" },
           { title: "Marketplace Sales", value: "+12,234", trend: "+19%", icon: <ShoppingBag className="w-4 h-4" />, color: "text-purple-500" },
           { title: "Active Now", value: "573", trend: "+201 since last hour", icon: <Activity className="w-4 h-4" />, color: "text-orange-500" }
        ].map((stat, i) => (
           <Card key={i} className="rounded-3xl border-none bg-card shadow-sm hover:shadow-md transition-shadow">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-bold text-muted-foreground">{stat.title}</CardTitle>
               <div className={`p-2 rounded-full bg-muted/40 ${stat.color}`}>
                  {stat.icon}
               </div>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-black">{stat.value}</div>
               <p className={`text-xs mt-2 font-bold flex items-center gap-1 ${stat.color}`}>
                  {i < 3 && <TrendingUp className="w-3 h-3" />} {stat.trend}
               </p>
             </CardContent>
           </Card>
        ))}
      </div>
      
      {/* Charts Layout Box */}
      <div className="grid gap-6 md:grid-cols-7 mt-2">
         <Card className="rounded-3xl border-none shadow-sm md:col-span-4 lg:col-span-5 bg-card flex flex-col">
            <CardHeader>
               <CardTitle className="font-black text-xl">Revenue vs Sales Overview</CardTitle>
               <p className="text-sm text-muted-foreground font-medium">Monthly trend for the current fiscal year.</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center py-20 min-h-[400px]">
               <BarChart3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
               <h3 className="text-lg font-bold text-muted-foreground">Chart Engine Loading...</h3>
               <p className="text-sm text-muted-foreground/60 w-1/2 text-center mt-2">Connect to a charting library (like Recharts) here using API data from the backend analytics endpoint.</p>
            </CardContent>
         </Card>
         
         <Card className="rounded-3xl border-none shadow-sm md:col-span-3 lg:col-span-2 bg-card flex flex-col">
            <CardHeader>
               <CardTitle className="font-black text-xl">Top Categories</CardTitle>
               <p className="text-sm text-muted-foreground font-medium">Sales distributed by division.</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
               {['Electronics', 'Apparel', 'Real Estate', 'Digital Goods'].map((cat, i) => (
                  <div key={i} className="flex items-center justify-between w-full">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-bold text-sm text-foreground/80">{cat}</span>
                     </div>
                     <span className="font-black text-sm">{80 - (i * 15)}%</span>
                  </div>
               ))}
               <div className="mt-auto pt-6 border-t border-border/40">
                  <Button variant="outline" className="w-full rounded-xl font-bold border-2">Download Report</Button>
               </div>
            </CardContent>
         </Card>
      </div>

    </div>
  )
}
