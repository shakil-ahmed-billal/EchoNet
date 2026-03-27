"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Tag, Home, MapIcon, Flag, BarChart3 } from "lucide-react"

export default function AdminDashboardOverview() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Platform analytics and management dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-none bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,482</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Products</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs animate-pulse text-red-500 font-medium">Requires immediate review</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Properties</CardTitle>
            <Home className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Analytics area placeholder */}
      <div className="h-[400px] rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center">
         <div className="text-center">
            <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Analytics Module Pending Integration</p>
         </div>
      </div>
    </div>
  )
}
