"use client";

import { SiteHeader } from "@/components/site-header"
import { LeftSidebar } from "@/components/layout/left-sidebar"
import { RightSidebar } from "@/components/layout/right-sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
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

  // Messages page: full-width, no sidebars, no padding
  if (isMessagesPage) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 min-h-0">
          {children}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background/50">
      <SiteHeader />
      <div className="flex-1 w-full px-2 sm:px-4 lg:px-8">
        <div className={cn(
          "grid gap-6 pt-4 md:pt-6 pb-32 md:pb-24 w-full",
          hideRightSidebar 
            ? "grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]" 
            : "grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_minmax(auto,680px)_320px] 2xl:grid-cols-[320px_minmax(auto,720px)_360px] xl:justify-between"
        )}>
          <div className="hidden lg:block">
            <LeftSidebar />
          </div>
          <main className="flex flex-col min-w-0 gap-6 w-full">
            {children}
          </main>
          {!hideRightSidebar && (
            <div className="hidden xl:block">
              <RightSidebar />
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
