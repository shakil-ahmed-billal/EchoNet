"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flag, Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ModProductsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Flagged Products</h1>
          <p className="text-muted-foreground mt-1">Review flagged marketplace items and take action.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." className="pl-9 rounded-full bg-card" />
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-card">
        <CardContent className="p-0">
           <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                 <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-bold">
                    <tr>
                       <th className="px-6 py-4">Product ID / Title</th>
                       <th className="px-6 py-4">Report Reason</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/40">
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="font-bold text-primary">Air Jordan {i} Retro High</span>
                              <span className="text-xs text-muted-foreground font-mono">prod_8xj92{i}m</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-orange-500 font-medium flex items-center gap-1.5 mt-1.5">
                           <AlertTriangle className="w-3.5 h-3.5" />
                           {i === 1 ? 'Counterfeit Item' : i === 2 ? 'Inappropriate Content' : 'Scam Listing'}
                           <span className="text-muted-foreground ml-1 text-xs">(3 reports)</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                              PENDING REVIEW
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" className="text-red-500 hover:text-red-500 hover:bg-red-500/10 border-red-200">
                                 <XCircle className="w-4 h-4 mr-1" /> Remove
                              </Button>
                              <Button size="sm" variant="outline" className="text-green-500 hover:text-green-500 hover:bg-green-500/10 border-green-200">
                                 <CheckCircle2 className="w-4 h-4 mr-1" /> Ignore
                              </Button>
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center py-4">
         <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest text-center">Connected to Flag Pipeline</p>
      </div>
    </div>
  )
}
