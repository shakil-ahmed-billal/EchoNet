"use client"

import * as React from "react"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { 
  Users, 
  LayoutDashboard, 
  Flag, 
  Home, 
  BarChart3, 
  Tag, 
  MessageSquare, 
  Layers, 
  ShieldCheck,
  Package,
  Clapperboard,
  Settings
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { SITE_INFO } from "@/config/site"
import { usePathname } from "next/navigation"

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const isAdmin = user.role === "ADMIN"

  const groups = [
    {
      label: "Platform Audit",
      items: [
        {
          title: "Overview",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Analytics",
          url: "/admin/dashboard/analytics",
          icon: BarChart3,
        },
        {
          title: "Platform Settings",
          url: "/admin/dashboard/settings",
          icon: Settings,
          hidden: !isAdmin,
        },
      ],
    },
    {
      label: "Community Management",
      items: [
        {
          title: "Users & Roles",
          url: "/admin/dashboard/users",
          icon: Users,
          hidden: !isAdmin,
        },
        {
          title: "Post Moderation",
          url: "/admin/dashboard/posts",
          icon: MessageSquare,
        },
        {
          title: "Stories Audit",
          url: "/admin/dashboard/stories",
          icon: Clapperboard,
        },
      ],
    },
    {
      label: "Trade & Commerce",
      items: [
        {
          title: "Marketplace",
          url: "/admin/dashboard/products",
          icon: Package,
        },
        {
          title: "Categories",
          url: "/admin/dashboard/categories",
          icon: Tag,
        },
      ],
    },
    {
      label: "Real Estate Hub",
      items: [
        {
          title: "Properties",
          url: "/admin/dashboard/properties",
          icon: Home,
        },
        {
          title: "Agent Verification",
          url: "/admin/dashboard/platform-agents",
          icon: ShieldCheck,
        },
      ],
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-border/40 bg-transparent">
      <SidebarHeader className="border-b border-border/10 pb-4 pt-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-105 active:scale-95 transition-all">
                <Layers className="size-5 shrink-0" />
              </div>
              <div className="grid flex-1 text-left leading-tight ml-1 overflow-hidden">
                <span className="truncate font-bold text-sm tracking-tight text-foreground">{SITE_INFO.name}</span>
                <span className="truncate text-[10px] font-medium text-muted-foreground tracking-wider">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="gap-0 py-4">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="py-1 px-2">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden pt-2 pb-2 text-xs font-bold text-muted-foreground/70 h-auto overflow-visible">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.filter(item => !item.hidden).map((item) => {
                  const isActive = pathname === item.url || (item.url !== "/admin/dashboard" && pathname?.startsWith(item.url))
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        render={<Link href={item.url} />}
                        isActive={isActive} 
                        tooltip={item.title}
                        className={`rounded-xl transition-all duration-200 font-medium text-sm ${
                          isActive 
                            ? "bg-primary/10 text-primary shadow-sm" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        <item.icon className="shrink-0 size-5" />
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <NavUser user={{
          name: user.name,
          email: user.email,
          avatar: (user as any).avatarUrl || user.image || ""
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
