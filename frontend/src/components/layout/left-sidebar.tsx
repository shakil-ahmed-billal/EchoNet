"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/config/site";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { UserImage } from "@/components/user-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Compass, Bell, Mail, User, MoreHorizontal, Users2, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LeftSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Discover", href: "/discover", icon: Compass },
    { title: "Notifications", href: "/notifications", icon: Bell },
    { title: "Messages", href: "/messages", icon: Mail },
    { title: "Friends", href: "/friends", icon: Users2 },
    { title: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { title: "My Store", href: "/store", icon: Store },
    { title: "Profile", href: user ? `/profile/${user.id}` : "/login", icon: User },
    { title: "More", href: "/more", icon: MoreHorizontal },
  ];

  return (
    <aside className="sticky top-16 flex flex-col bg-transparent px-2 overflow-y-auto h-[calc(100vh-64px)] no-scrollbar pt-8">
      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {isAuthenticated && user && (
            <li className="mb-2">
              <Link
                href={`/profile/${user.id}`}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all group hover:bg-muted/50 text-foreground",
                  pathname === `/profile/${user.id}` && "bg-primary/10 text-primary shadow-sm"
                )}
              >
                <UserImage 
                  user={user} 
                  className="h-6 w-6 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all shrink-0" 
                />
                <span className="truncate text-sm font-bold">{user.name}</span>
              </Link>
            </li>
          )}
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-sm" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "size-5 transition-transform group-hover:scale-110",
                    isActive ? "text-primary fill-primary/10" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span>{item.title}</span>
                  {isActive && (
                    <div className="absolute left-[-16px] w-1.5 h-6 bg-primary rounded-r-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Brand & Support */}
      <div className="mt-auto pt-6 border-t border-border/10">
        <div className="bg-card/40 rounded-2xl p-5 mb-6 group hover:bg-card/60 transition-colors border border-border/40 shadow-sm">
           <div className="flex items-center gap-2 mb-2">
             <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center">
               <div className="size-2 rounded-full bg-primary" />
             </div>
             <p className="text-xs text-foreground font-bold tracking-tight">EchoNet Premium</p>
           </div>
           <p className="text-[11px] text-muted-foreground/60 leading-relaxed mb-4 font-medium">Unlock exclusive tools and stand out with a verified badge.</p>
           <Button 
            size="sm" 
            className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 h-9 text-[11px] font-bold active:scale-95 transition-all shadow-sm"
            onClick={() => toast.info("Premium features are coming soon!")}
           >
              Learn More
           </Button>
        </div>
        <div className="px-2 pb-6 space-y-1">
          <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest leading-relaxed">
            &copy; 2026 EchoNet Inc.
          </p>
          <p className="text-[9px] text-muted-foreground/20 font-bold uppercase tracking-widest hover:text-muted-foreground/40 transition-colors cursor-pointer">
            Privacy • Terms • Cookie Policy
          </p>
        </div>
      </div>
    </aside>
  );
}
