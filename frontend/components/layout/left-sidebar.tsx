"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/config/site";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Compass, Bell, Mail, User, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LeftSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Discover", href: "/discover", icon: Compass },
    { title: "Notifications", href: "/notifications", icon: Bell },
    { title: "Messages", href: "/messages", icon: Mail },
    { title: "Profile", href: user ? `/profile/${user.id}` : "/login", icon: User },
    { title: "More", href: "/more", icon: MoreHorizontal },
  ];

  return (
    <aside className="sticky top-20 flex flex-col bg-background px-1 py-0 overflow-y-auto h-[calc(100vh-100px)]">
      {/* Profile Summary Card - Premium Look */}
      {isAuthenticated && user && (
        <div className="mb-6 px-1">
          <Link 
            href={`/profile/${user.id}`}
            className="flex items-center gap-3 p-2.5 rounded-2xl bg-card border border-border/40 hover:bg-card/60 hover:border-border/60 transition-all group shadow-sm"
          >
            <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary/40 transition-colors shadow-inner">
              <AvatarImage src={user.image} />
              <AvatarFallback className="bg-primary/5 text-primary text-base font-bold">
                {user.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 gap-0.5">
              <p className="font-bold text-xs text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground font-medium">View Profile</p>
            </div>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
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
                    <div className="absolute left-[-16px] w-1.5 h-6 bg-primary rounded-r-full shadow-lg shadow-primary/20" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Brand & Support */}
      <div className="mt-auto pt-6 border-t border-border/20">
        <div className="bg-primary/5 rounded-2xl p-4 mb-6 group hover:bg-primary/10 transition-colors pointer-cursor">
           <p className="text-[10px] text-primary/70 font-bold uppercase tracking-wider mb-1">Support EchoNet</p>
           <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">Help us build the next generation of social networking.</p>
           <Button size="sm" className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20 h-8 text-[11px] font-bold">
              Upgrade
           </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/40 font-bold leading-relaxed px-2 pb-4">
          &copy; 2026 EchoNet Inc.<br/>
          Privacy • Terms • Cookie Policy
        </p>
      </div>
    </aside>
  );
}
