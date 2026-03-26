"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search, MessageCircle, Loader2, Users, MoreHorizontal, UserCircle, ShieldAlert } from "lucide-react";
import { UserImage } from "@/components/user-image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMessenger } from "./messenger-context";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/services/api-client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useSocket } from "@/components/socket-provider";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function MessengerDrawer() {
  const { isDrawerOpen, closeDrawer, openChat, openGroupModal, perUserData, markUserRead, groups } = useMessenger();
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const drawerRef = useRef<HTMLDivElement>(null);

  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["users", "messenger-drawer"],
    queryFn: async () => {
      const res = await apiClient.get("/users");
      return res.data.data.filter((u: any) => u.id !== currentUser?.id);
    },
    enabled: !!currentUser,
    staleTime: 60000,
  });

  // Track online status
  useEffect(() => {
    if (!socket) return;
    const handleStatus = (data: { userId: string; status: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.status === "online") next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    };
    socket.on("user-status", handleStatus);
    return () => { socket.off("user-status", handleStatus); };
  }, [socket]);

  // Close on outside click
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeDrawer();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isDrawerOpen, closeDrawer]);

  // Combine users and groups into a single array and sort by recent messages
  const allChats = [
    ...(users || []).map(u => ({ ...u, isGroup: false })),
    ...groups.map(g => ({ ...g, isGroup: true, image: null, avatarUrl: null }))
  ].sort((a, b) => {
    const timeA = perUserData[a.id]?.lastMessageTime ? new Date(perUserData[a.id].lastMessageTime!).getTime() : 0;
    const timeB = perUserData[b.id]?.lastMessageTime ? new Date(perUserData[b.id].lastMessageTime!).getTime() : 0;
    return timeB - timeA;
  });

  const filtered = allChats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300",
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-[340px] flex flex-col bg-card/95 backdrop-blur-xl border-l border-border/30 shadow-2xl transition-transform duration-300 ease-in-out",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/20">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="size-4 text-primary" />
            </div>
            <h2 className="text-[18px] font-bold tracking-tight text-foreground">Messages</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full size-9 hover:bg-muted/70 text-muted-foreground"
              onClick={openGroupModal}
              title="New Group"
            >
              <Users className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeDrawer}
              className="rounded-full size-9 hover:bg-muted/70 text-muted-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people..."
              className="pl-9 h-9 rounded-full bg-muted/60 border-0 shadow-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* People list */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-2 pb-4 space-y-0.5">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-5 animate-spin text-muted-foreground/40" />
              </div>
            ) : filtered && filtered.length > 0 ? (
              filtered.map((u: any) => (
                <div key={u.id} className="group relative flex items-center rounded-xl hover:bg-muted/60 transition-all pr-1">
                  <button
                    onClick={() => {
                      if (u.isGroup) {
                        router.push(`/messages?groupId=${u.id}`);
                        closeDrawer();
                      } else {
                        openChat({
                          id: u.id,
                          name: u.name,
                          avatarUrl: u.avatarUrl,
                          image: u.image,
                        });
                      }
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 flex-1 text-left"
                  >
                    <div className="relative shrink-0">
                      {u.isGroup ? (
                        <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Users className="size-6 text-primary" />
                        </div>
                      ) : (
                        <UserImage user={u} className="size-11" />
                      )}
                      {!u.isGroup && onlineUsers.has(u.id) && (
                        <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 ring-2 ring-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-sm text-foreground truncate leading-tight flex-1">
                          {u.name}
                        </p>
                        {perUserData[u.id]?.lastMessageTime && (
                          <span className="text-[9px] text-muted-foreground/50 shrink-0">
                            {formatDistanceToNow(new Date(perUserData[u.id].lastMessageTime!), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-[11px] text-muted-foreground/60 truncate flex-1">
                          {perUserData[u.id]?.lastMessage ? (
                            <span className={perUserData[u.id]?.unreadCount > 0 ? "font-semibold text-foreground/80" : ""}>
                              {perUserData[u.id].lastMessage.length > 28
                                ? perUserData[u.id].lastMessage.slice(0, 28) + "…"
                                : perUserData[u.id].lastMessage}
                            </span>
                          ) : !u.isGroup && onlineUsers.has(u.id) ? (
                            <span className="text-green-500 font-medium">Active now</span>
                          ) : (
                            "Tap to message"
                          )}
                        </p>
                        {(perUserData[u.id]?.unreadCount ?? 0) > 0 && (
                          <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">
                            {perUserData[u.id].unreadCount > 9 ? "9+" : perUserData[u.id].unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Per-user 3-dot menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-xl">
                      <DropdownMenuItem onClick={() => { router.push(`/profile/${u.id}`); closeDrawer(); }}>
                        <UserCircle className="mr-2 size-4" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/profile/${u.id}`);
                        toast.success("Link copied!");
                      }}>
                        <MessageCircle className="mr-2 size-4" /> Copy Profile Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <ShieldAlert className="mr-2 size-4" /> Block User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  {search ? `No results for "${search}"` : "No contacts found"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer: open full messages page */}
        <div className="border-t border-border/20 p-3">
          <Button
            variant="ghost"
            className="w-full rounded-xl h-10 text-sm font-semibold text-primary hover:bg-primary/10"
            onClick={() => { router.push("/messages"); closeDrawer(); }}
          >
            See All in Messenger
          </Button>
        </div>
      </div>
    </>
  );
}
