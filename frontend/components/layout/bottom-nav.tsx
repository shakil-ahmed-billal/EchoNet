"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";
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
    { icon: PlusSquare, label: "Create", href: "/create" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { 
      label: "Profile", 
      href: `/profile/${user?.id}`,
      isProfile: true 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[72px] md:hidden bg-background/90 backdrop-blur-xl border-t border-border/40 flex items-center justify-around px-2 pb-2 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href || "/"}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.isProfile ? (
              <Avatar className={cn(
                "h-6 w-6 ring-2 transition-all",
                isActive ? "ring-primary" : "ring-transparent"
              )}>
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="text-[8px] font-bold">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              Icon && <Icon className={cn("size-6", isActive && "fill-current/10")} />
            )}
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
