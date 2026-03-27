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
  const isFriendsPage = pathname.startsWith("/friends");
  const isMarketplacePage = pathname.startsWith("/marketplace");
  const isStorePage = pathname.startsWith("/store");
  const isCheckoutPage = pathname.startsWith("/checkout");
  const hideRightSidebar = isProfilePage || isMessagesPage || isFriendsPage || isMarketplacePage || isStorePage || isCheckoutPage;

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
      <div className="flex-1 w-full  sm:px-4 lg:px-8">
        <div className={cn(
          "grid gap-8 w-full h-full",
          hideRightSidebar 
            ? "grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]" 
            : "grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[260px_1fr_320px] 2xl:grid-cols-[280px_1fr_340px] xl:justify-between"
        )}>
          <div className="hidden lg:block h-full">
            <LeftSidebar />
          </div>
          <main className="flex flex-col min-w-0 gap-6 w-full pt-8">
            {children}
          </main>
          {!hideRightSidebar && (
            <div className="hidden xl:block h-full">
              <RightSidebar />
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
