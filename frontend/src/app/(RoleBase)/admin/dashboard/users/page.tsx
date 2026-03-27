"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Search, MoreHorizontal, UserX, ShieldAlert, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Users Management</h1>
          <p className="text-muted-foreground mt-1">Suspend, delete, and change roles of EchoNet users.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users by name or email..." className="pl-9 rounded-full bg-card" />
          </div>
          <Button variant="outline" className="rounded-full">Export CSV</Button>
        </div>
      </div>

      <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
           <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                 <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-bold">
                    <tr>
                       <th className="px-6 py-4">User</th>
                       <th className="px-6 py-4">Role</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Joined At</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/40">
                    {/* Placeholder Rows */}
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                 U{i}
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-bold">John Doe {i}</span>
                                 <span className="text-xs text-muted-foreground">john.doe{i}@example.com</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                              {i === 1 ? 'ADMIN' : i === 2 ? 'MODERATOR' : 'USER'}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           {i === 4 ? (
                              <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold"><ShieldAlert className="w-3.5 h-3.5" /> Suspended</span>
                           ) : (
                              <span className="flex items-center gap-1.5 text-green-500 text-xs font-bold"><ShieldCheck className="w-3.5 h-3.5" /> Active</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-medium">May 12, 2024</td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <MoreHorizontal className="w-4 h-4" />
                           </Button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center py-4">
         <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest text-center">Connected to EchoNet User Core</p>
      </div>
    </div>
  )
}
