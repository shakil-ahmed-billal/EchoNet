"use client";

import { SiteHeader } from "@/components/site-header"
import { LeftSidebar } from "@/components/layout/left-sidebar"
import { RightSidebar } from "@/components/layout/right-sidebar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isProfilePage = pathname.startsWith("/profile");
  const isMessagesPage = pathname.startsWith("/messages");
  const hideRightSidebar = isProfilePage || isMessagesPage;

  return (
    <div className="flex min-h-screen flex-col bg-background/50">
      <SiteHeader />
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8">
        <div className={cn(
          "grid gap-8",
          !isMessagesPage && "pt-8 pb-20",
          hideRightSidebar 
            ? "grid-cols-1 lg:grid-cols-[280px_1fr]" 
            : "grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px]"
        )}>
          <LeftSidebar />
          <main className={cn(
            "flex flex-col min-w-0",
            !isMessagesPage && "gap-8"
          )}>
            {children}
          </main>
          {!hideRightSidebar && <RightSidebar />}
        </div>
      </div>
    </div>
  )
}
