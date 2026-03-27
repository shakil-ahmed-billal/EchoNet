"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag, FileText, AlertTriangle } from "lucide-react"

export default function ModeratorDashboardOverview() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Moderator Overview</h1>
        <p className="text-muted-foreground mt-1">Review flagged content and moderate user posts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-none bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Flags</CardTitle>
            <Flag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground mt-1">Items requiring your attention</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Posts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs mt-1 animate-pulse text-red-500 font-medium">High priority investigations</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions Today</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">Resolved reports and moderations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
