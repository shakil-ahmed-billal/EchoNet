"use client"

import { useState } from "react"
import { useMyProperties, useDeleteProperty } from "@/hooks/use-property"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Home, 
  Plus, 
  Search, 
  MapPin, 
  Trash2, 
  ExternalLink,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination-controls"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function MyPropertiesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  
  const { data, isLoading } = useMyProperties({ 
    searchTerm: search || undefined, 
    page, 
    limit: 10 
  })
  
  const { mutate: deleteProperty } = useDeleteProperty()

  const properties = data?.data ?? []
  const meta = data?.meta

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this listing? Status will be changed to INACTIVE.")) {
      deleteProperty(id)
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your real estate listings and track their approval status.</p>
        </div>
        <Link href="/properties">
          <Button className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2">
            <Plus className="w-5 h-5" />
            Add New Property
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Total Listings" 
          value={meta?.total || 0} 
          icon={<Home className="w-5 h-5" />} 
          color="bg-primary/10 text-primary"
        />
        <StatCard 
          title="Active" 
          value={properties.filter((p: any) => p.status === 'ACTIVE').length} 
          icon={<CheckCircle2 className="w-5 h-5" />} 
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard 
          title="Pending Approval" 
          value={properties.filter((p: any) => p.status === 'PENDING').length} 
          icon={<Clock className="w-5 h-5" />} 
          color="bg-amber-500/10 text-amber-500"
        />
      </div>

      {/* Main Content */}
      <Card className="rounded-3xl border-border/20 shadow-xl overflow-hidden bg-card/50 backdrop-blur-md p-0">
        <CardHeader className="p-6 border-b border-border/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>Search and manage your property portfolio</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              className="pl-9 rounded-2xl bg-background/50 border-border/20 h-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 font-bold border-b border-border/10">
                <tr>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Listed Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-12 w-16 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></div></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  ))
                ) : properties.length > 0 ? (
                  properties.map((property: any) => (
                    <tr key={property.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/10 shadow-sm">
                            {property.images?.[0] ? (
                              <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Home className="w-6 h-6 text-muted-foreground/30" /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate max-w-[250px]">{property.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{property.city}, {property.area}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={property.status} />
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        ${Number(property.price).toLocaleString()}
                        <span className="text-[10px] ml-1 text-muted-foreground font-normal">/{property.priceUnit}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        {format(new Date(property.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/properties/${property.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl w-40">
                              <DropdownMenuItem className="text-xs font-semibold">
                                <Eye className="w-4 h-4 mr-2" /> View Listing
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs font-semibold text-red-500 focus:text-red-500" onClick={() => handleDelete(property.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Home className="w-16 h-16 mb-4" />
                        <p className="text-xl font-bold">No properties found</p>
                        <p className="text-sm">You haven't listed any properties yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {meta && meta.total > meta.limit && (
        <div className="mt-4">
          <Pagination
            meta={meta}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-2xl shadow-sm p-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium tracking-wider">{title}</p>
            <p className="text-2xl font-black tracking-tight">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; class: string; icon: any }> = {
    ACTIVE: { label: 'Active', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    PENDING: { label: 'Pending', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
    REJECTED: { label: 'Rejected', class: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
    INACTIVE: { label: 'Inactive', class: 'bg-muted text-muted-foreground border-border/40', icon: Eye },
  }

  const config = configs[status] || configs.PENDING
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide border ${config.class}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
