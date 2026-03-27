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
} from "@/components/ui/sidebar"
import { LayoutDashboard, Flag, FileText } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { SITE_INFO } from "@/config/site"

export function ModeratorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  if (!user) return null

  const moderatorNav = [
    {
      title: "Overview",
      url: "/moderator/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      title: "Flagged Products",
      url: "/moderator/dashboard/products",
      icon: <Flag />,
    },
    {
      title: "Posts Moderation",
      url: "/moderator/dashboard/posts",
      icon: <FileText />,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 h-16 flex justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-500 text-primary-foreground shadow-sm">
                <span className="font-bold text-lg">E</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black text-lg -mt-0.5">{SITE_INFO.name}</span>
                <span className="truncate text-[10px] font-bold tracking-widest text-emerald-500 uppercase">Moderator Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Mod Controls</SidebarGroupLabel>
          <SidebarMenu>
            {moderatorNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} render={<Link href={item.url} />}>
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40">
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
