"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Tag, PlusCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function AdminCategoriesPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Marketplace Categories</h1>
          <p className="text-muted-foreground mt-1">Create, update, and manage global product categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="rounded-full shadow-md hover:scale-[1.02] transition-transform">
             <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-card">
        <CardContent className="p-0">
           <div className="w-full overflow-auto">
              <table className="w-full text-sm text-left">
                 <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-bold">
                    <tr>
                       <th className="px-6 py-4">ID</th>
                       <th className="px-6 py-4">Name</th>
                       <th className="px-6 py-4">Slug</th>
                       <th className="px-6 py-4">Icon URL</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/40">
                    {['Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((cat, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">cat_{i}9xj2</td>
                        <td className="px-6 py-4 font-bold text-primary flex items-center gap-2">
                           <Tag className="w-4 h-4" /> {cat}
                        </td>
                        <td className="px-6 py-4 font-medium">{cat.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')}</td>
                        <td className="px-6 py-4 text-muted-foreground text-xs truncate max-w-[150px]">
                           https://example.com/icons/{i}.svg
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-8">Edit</Button>
                              <Button size="sm" variant="outline" className="h-8 text-red-500 hover:text-red-500 border-red-200">Delete</Button>
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
         <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest text-center">Connected to Category Management</p>
      </div>
    </div>
  )
}
