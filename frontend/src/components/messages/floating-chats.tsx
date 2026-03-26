"use client";

import { useEffect, useRef, useState } from "react";
import {
  X, Minus, Send, ThumbsUp, Loader2, Phone, Video,
  MoreHorizontal, UserCircle, Share2, BellOff, ShieldAlert,
  Check, CheckCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserImage } from "@/components/user-image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMessenger, ActiveChat } from "./messenger-context";
import { useAuth } from "@/hooks/use-auth";
import { useChatHistory, useMarkMessagesRead, useSendMessage } from "@/hooks/use-messages";
import { useSocket } from "@/components/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ────────────────────────────────────────────────────────────────────────────
// Single floating chat popup
// ────────────────────────────────────────────────────────────────────────────
function ChatPopup({ chat, index }: { chat: ActiveChat; index: number }) {
  const { closeChat, minimizeChat, restoreChat, initiateCall } = useMessenger();
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isOpen = chat.state === "open";
  const isMinimized = chat.state === "minimized";
  const userId = chat.user.id;

  const { data: messages, isLoading } = useChatHistory(userId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: markAsRead } = useMarkMessagesRead();

  // Responsive bottom stack — open chats grow leftward
  const rightOffset = 20 + index * 340;

  // Scroll to bottom on new messages when open
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Mark as read when window opens
  useEffect(() => {
    if (isOpen && messages && messages.length > 0) {
      const hasUnread = messages.some((m: any) => m.senderId === userId && !m.isRead);
      if (hasUnread) {
        markAsRead(userId);
        setUnreadCount(0);
      }
    }
  }, [messages, isOpen, userId, markAsRead]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.emit("check-online", { userId }, (res: { online: boolean }) => {
      setIsOnline(res.online);
    });

    const onStatus = (data: { userId: string; status: string }) => {
      if (data.userId === userId) setIsOnline(data.status === "online");
    };
    const onTyping = (data: { from: string }) => {
      if (data.from === userId) setIsTyping(true);
    };
    const onStopTyping = (data: { from: string }) => {
      if (data.from === userId) setIsTyping(false);
    };
    const onNewMessage = (msg: any) => {
      const isForThisChat =
        (msg.senderId === userId && msg.receiverId === currentUser?.id) ||
        (msg.senderId === currentUser?.id && msg.receiverId === userId);
      if (!isForThisChat) return;

      queryClient.setQueryData(["messages", userId], (old: any[]) => {
        if (!old) return [msg];
        if (old.some((m) => m.id === msg.id)) return old;
        return [...old, msg];
      });
      if (msg.senderId === userId) {
        if (isOpen) {
          markAsRead(userId);
        } else {
          setUnreadCount((c) => c + 1);
        }
      }
    };

    socket.on("user-status", onStatus);
    socket.on("typing", onTyping);
    socket.on("stop-typing", onStopTyping);
    socket.on("new-message", onNewMessage);
    return () => {
      socket.off("user-status", onStatus);
      socket.off("typing", onTyping);
      socket.off("stop-typing", onStopTyping);
      socket.off("new-message", onNewMessage);
    };
  }, [socket, userId, currentUser, queryClient, markAsRead, isOpen]);

  const handleRestore = () => {
    restoreChat(userId);
    setUnreadCount(0);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage({ receiverId: userId, content: input });
    setInput("");
    if (socket) socket.emit("stop-typing", { to: userId });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit("typing", { to: userId });
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => socket.emit("stop-typing", { to: userId }), 2000);
    setTypingTimeout(t);
  };

  const handleCall = (video: boolean) => initiateCall(chat.user, video);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${userId}`);
    toast.success("Profile link copied!");
  };

  // ── MINIMIZED: circular bubble ──────────────────────────────────────────
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-6 z-50"
        style={{ right: `${20 + index * 76}px` }}
      >
        <button
          onClick={handleRestore}
          className="relative group size-14 rounded-full shadow-xl ring-2 ring-primary/20 hover:ring-primary/60 transition-all hover:scale-110 active:scale-95 focus:outline-none"
          title={chat.user.name}
        >
          <UserImage user={chat.user} className="size-14" />
          {isOnline && (
            <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-background" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-foreground text-background text-xs font-semibold rounded-lg px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            {chat.user.name}
          </div>
        </button>
        <button
          onClick={() => closeChat(userId)}
          className="absolute -top-1.5 -left-1.5 size-5 rounded-full bg-muted border border-border/60 text-muted-foreground hover:bg-destructive hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 shadow"
        >
          <X className="size-2.5" />
        </button>
      </div>
    );
  }

  // ── OPEN: full chat window ──────────────────────────────────────────────
  return (
    <div
      className="fixed bottom-0 z-50 flex flex-col shadow-2xl rounded-t-2xl overflow-hidden"
      style={{ right: `${rightOffset}px`, width: "320px" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border/30 border-b-0 rounded-t-2xl cursor-pointer select-none">
        <button
          onClick={() => router.push(`/profile/${userId}`)}
          className="relative shrink-0 hover:opacity-80 transition-opacity"
        >
          <UserImage user={chat.user} className="size-9" />
          {isOnline && (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-card" />
          )}
        </button>

        <button
          onClick={() => router.push(`/profile/${userId}`)}
          className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          <p className="font-semibold text-[13px] text-foreground truncate leading-tight">
            {chat.user.name}
          </p>
          <p className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5">
            {isTyping ? (
              <span className="text-primary font-medium animate-pulse">typing…</span>
            ) : isOnline ? (
              <span className="text-green-500 font-medium">Active now</span>
            ) : (
              "Offline"
            )}
          </p>
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => handleCall(false)}
            className="size-7 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
            title="Audio call"
          >
            <Phone className="size-3.5" />
          </button>
          <button
            onClick={() => handleCall(true)}
            className="size-7 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
            title="Video call"
          >
            <Video className="size-3.5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all">
                <MoreHorizontal className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={() => router.push(`/profile/${userId}`)}>
                <UserCircle className="mr-2 size-4" /> View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                <Share2 className="mr-2 size-4" /> Share Profile Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <BellOff className="mr-2 size-4" /> Mute Notifications
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <ShieldAlert className="mr-2 size-4" /> Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => minimizeChat(userId)}
            className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
            title="Minimize"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            onClick={() => closeChat(userId)}
            className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            title="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Messages area ──────────────────────────────────────────────── */}
      <div className="bg-card border-x border-border/30 h-[360px] flex flex-col">
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-0.5 p-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground/40" />
              </div>
            ) : (
              <>
                {(!messages || messages.length === 0) && (
                  <div className="flex flex-col items-center py-8 text-center">
                    <button onClick={() => router.push(`/profile/${userId}`)}>
                      <UserImage user={chat.user} className="size-16 mb-3 hover:opacity-80 transition-opacity" />
                    </button>
                    <p className="text-sm font-semibold text-foreground">{chat.user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Say hi! 👋</p>
                  </div>
                )}

                {messages?.map((msg: any, idx: number) => {
                  const isMe = msg.senderId === currentUser?.id;
                  const prev = messages[idx - 1];
                  const next = messages[idx + 1];
                  const isFirst = !prev || prev.senderId !== msg.senderId;
                  const isLast = !next || next.senderId !== msg.senderId;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-1 group",
                        isMe ? "justify-end" : "justify-start",
                        isFirst ? "mt-2" : "mt-0.5"
                      )}
                    >
                      {!isMe && (
                        <div className="w-6 shrink-0">
                          {isLast && (
                            <button onClick={() => router.push(`/profile/${userId}`)}>
                              <UserImage user={chat.user} className="size-6 hover:opacity-80 transition-opacity" />
                            </button>
                          )}
                        </div>
                      )}

                      <div className={cn("flex flex-col max-w-[75%]", isMe ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "px-3 py-2 text-[13px] leading-relaxed wrap-break",
                            isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                            isFirst && isLast && "rounded-2xl",
                            isFirst && !isLast && isMe && "rounded-2xl rounded-br-md",
                            isFirst && !isLast && !isMe && "rounded-2xl rounded-bl-md",
                            !isFirst && !isLast && isMe && "rounded-l-2xl rounded-r-md",
                            !isFirst && !isLast && !isMe && "rounded-r-2xl rounded-l-md",
                            isLast && !isFirst && isMe && "rounded-2xl rounded-tr-md",
                            isLast && !isFirst && !isMe && "rounded-2xl rounded-tl-md",
                          )}
                        >
                          {msg.content}
                        </div>
                        {isLast && (
                          <div className={cn(
                            "flex items-center gap-1 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-muted-foreground",
                            isMe ? "flex-row-reverse" : "flex-row"
                          )}>
                            {format(new Date(msg.createdAt), "p")}
                            {isMe && (
                              msg.isRead
                                ? <CheckCheck className="size-2.5 text-primary" />
                                : <Check className="size-2.5 text-muted-foreground/40" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-end gap-1 mt-2">
                    <UserImage user={chat.user} className="size-6" />
                    <div className="bg-muted rounded-2xl px-3 py-2.5 flex gap-1 items-center">
                      <span className="size-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="size-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="size-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ── Input footer ────────────────────────────────────────────────── */}
      <div className="bg-card border border-border/30 rounded-b-2xl px-3 py-2.5 flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Aa"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="h-9 rounded-full bg-muted/60 border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm px-4 placeholder:text-muted-foreground/50"
          />
        </div>
        {input.trim() ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSend}
            disabled={isSending}
            className="size-8 rounded-full text-primary hover:bg-primary/10 shrink-0 transition-all hover:scale-110 active:scale-95"
          >
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 fill-current" />}
          </Button>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => sendMessage({ receiverId: userId, content: "👍" })}
            className="size-8 rounded-full text-primary hover:bg-primary/10 shrink-0 transition-all hover:scale-110 active:scale-95"
          >
            <ThumbsUp className="size-4 fill-current" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Container: renders all active floating chats ─────────────────────────────
export function FloatingChats() {
  const { activeChats } = useMessenger();
  const pathname = usePathname();

  if (activeChats.length === 0 || pathname === "/messages") return null;
  return (
    <>
      {activeChats.map((chat, i) => (
        <ChatPopup key={chat.user.id} chat={chat} index={i} />
      ))}
    </>
  );
}
