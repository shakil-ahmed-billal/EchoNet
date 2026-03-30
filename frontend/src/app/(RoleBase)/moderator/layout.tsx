import { ModeratorSidebar } from "@/components/admin/moderator-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ModeratorSidebar />
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/40 px-6 transition-all bg-background sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-3 hover:bg-muted/50 rounded-xl transition-colors" />
            <Separator orientation="vertical" className="h-4 bg-border/40" />
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/moderator/dashboard" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                    Moderator Platform
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block opacity-40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-bold text-foreground">
                    Mod Control Center
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-blue-600">Moderation Active</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto py-5 px-6 lg:px-10 no-scrollbar">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
