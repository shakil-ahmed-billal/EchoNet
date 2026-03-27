"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Search, MoreHorizontal, ShieldOff } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ModPostsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Posts Moderation</h1>
          <p className="text-muted-foreground mt-1">Edit or delete any user posts violating community guidelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by post content..." className="pl-9 rounded-full bg-card" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
             <Card key={i} className="rounded-2xl border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow">
               <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Post ID: {i}A9B3</span>
                       <span className="bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider">
                         2 REPORTS
                       </span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed line-clamp-4">
                       "This is an automated user post containing placeholder text for the moderation feed. Users might post inappropriate content here that requires moderation."
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                     <span className="text-xs font-bold text-muted-foreground truncate w-1/2">by @user_{i}99</span>
                     <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold px-3 hover:text-red-500">
                           Delete
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                           <MoreHorizontal className="w-4 h-4" />
                        </Button>
                     </div>
                  </div>
               </CardContent>
             </Card>
          ))}
      </div>
      
    </div>
  )
}
