import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-2" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="font-bold text-sm tracking-tight text-muted-foreground uppercase">Admin Control Panel</div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-6 pt-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
