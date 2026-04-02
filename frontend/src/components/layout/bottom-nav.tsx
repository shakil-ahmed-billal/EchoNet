"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Bell, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const items = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: PlusSquare, label: "Create", href: "/feed?create=true" },
    { icon: Bell, label: "Alerts", href: "/notifications" },
    {
      label: "Profile",
      href: `/profile/${user?.id}`,
      isProfile: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[64px] md:hidden bg-background/95 backdrop-blur-xl border-t border-border/30 flex items-stretch justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {items.map((item) => {
        const isActive = item.href === "/"
          ? pathname === "/"
          : pathname.startsWith(item.href.split("?")[0]);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href || "/"}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 transition-all active:scale-90 duration-200",
              isActive ? "text-primary" : "text-muted-foreground/60"
            )}
          >
            <div className={cn(
              "flex items-center justify-center size-8 rounded-xl transition-all duration-200",
              isActive && "bg-primary/8"
            )}>
              {item.isProfile ? (
                <Avatar className={cn(
                  "h-6 w-6 ring-2 transition-all duration-300",
                  isActive ? "ring-primary" : "ring-transparent"
                )}>
                  <AvatarImage src={user?.image} alt={user?.name} />
                  <AvatarFallback className="text-[8px] font-bold">
                    {user?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                Icon && <Icon className={cn("size-[22px]", isActive && "stroke-[2.5px]")} />
              )}
            </div>
            <span className={cn(
              "text-[10px] font-semibold leading-none",
              isActive ? "opacity-100" : "opacity-50"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
