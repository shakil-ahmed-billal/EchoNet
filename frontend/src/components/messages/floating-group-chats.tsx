"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  X, Minus, Send, ThumbsUp, Loader2, Phone, Video,
  MoreHorizontal, Users, BellOff, ShieldAlert, Check, CheckCheck,
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
import { useMessenger, GroupChat } from "./messenger-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Group avatar stack
function GroupAvatarStack({ members }: { members: any[] }) {
  return (
    <div className="relative size-9 shrink-0">
      {members.slice(0, 2).map((m, i) => (
        <UserImage
          key={m.id}
          user={m}
          className={cn(
            "absolute size-6 ring-2 ring-card",
            i === 0 ? "top-0 left-0" : "bottom-0 right-0"
          )}
        />
      ))}
      {members.length > 2 && (
        <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-muted border border-card text-muted-foreground text-[8px] font-bold flex items-center justify-center">
          +{members.length - 2}
        </span>
      )}
    </div>
  );
}

// Single group chat popup
function GroupChatPopup({ group, index }: { group: GroupChat; index: number }) {
  const { closeGroupChat, minimizeGroupChat, restoreGroupChat } = useMessenger();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ id: string; sender: string; content: string; time: Date }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isOpen = group.state === "open";
  const isMinimized = group.state === "minimized";

  // Group chats sit to the left of individual chats; offset by active chat count
  const rightOffset = 20 + index * 340;

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: "me", content: input, time: new Date() },
    ]);
    setInput("");
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleCall = (video: boolean) => {
    toast.info(`Group ${video ? "video" : "audio"} call — coming soon!`);
  };

  // Minimized: circular stacked avatar bubble
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-6 z-50 group"
        style={{ right: `${20 + index * 76}px` }}
      >
        <button
          onClick={() => restoreGroupChat(group.id)}
          title={group.name}
          className="relative size-14 rounded-full shadow-xl ring-2 ring-primary/20 hover:ring-primary/60 transition-all hover:scale-110 active:scale-95"
        >
          <div className="size-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            <GroupAvatarStack members={group.members} />
          </div>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-foreground text-background text-xs font-semibold rounded-lg px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {group.name}
          </div>
        </button>
        <button
          onClick={() => closeGroupChat(group.id)}
          className="absolute -top-1 -left-1 size-5 rounded-full bg-muted border border-border/60 text-muted-foreground hover:bg-destructive hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <X className="size-2.5" />
        </button>
      </div>
    );
  }

  // Open: full popup
  return (
    <div
      className="fixed bottom-0 z-50 flex flex-col shadow-2xl rounded-t-2xl overflow-hidden"
      style={{ right: `${rightOffset}px`, width: "320px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border/30 border-b-0 rounded-t-2xl">
        <div className="shrink-0">
          <GroupAvatarStack members={group.members} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[13px] text-foreground truncate leading-tight">{group.name}</p>
          <p className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5">
            {group.members.length} members
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => handleCall(false)}
            className="size-7 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
            title="Group Audio Call"
          >
            <Phone className="size-3.5" />
          </button>
          <button
            onClick={() => handleCall(true)}
            className="size-7 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
            title="Group Video Call"
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
              <DropdownMenuItem onClick={() => toast.info("View members")}>
                <Users className="mr-2 size-4" /> View Members
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <BellOff className="mr-2 size-4" /> Mute Group
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <ShieldAlert className="mr-2 size-4" /> Leave Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => minimizeGroupChat(group.id)}
            className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-all"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            onClick={() => closeGroupChat(group.id)}
            className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-card border-x border-border/30 h-[360px] flex flex-col">
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-1 p-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Users className="size-7 text-primary/40" />
                </div>
                <p className="text-sm font-semibold text-foreground">{group.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {group.members.map((m) => m.name.split(" ")[0]).join(", ")}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">Start the group conversation!</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[75%] px-3 py-2 text-[13px] bg-primary text-primary-foreground rounded-2xl rounded-br-md">
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="bg-card border border-border/30 rounded-b-2xl px-3 py-2.5 flex items-center gap-2">
        <Input
          type="text"
          placeholder="Aa"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="h-9 rounded-full bg-muted/60 border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm px-4"
        />
        {input.trim() ? (
          <Button
            size="icon" variant="ghost"
            onClick={handleSend}
            className="size-8 rounded-full text-primary hover:bg-primary/10 transition-all hover:scale-110"
          >
            <Send className="size-4 fill-current" />
          </Button>
        ) : (
          <Button
            size="icon" variant="ghost"
            onClick={() => setMessages((p) => [...p, { id: String(Date.now()), sender: "me", content: "👍", time: new Date() }])}
            className="size-8 rounded-full text-primary hover:bg-primary/10 transition-all hover:scale-110"
          >
            <ThumbsUp className="size-4 fill-current" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Container for all group chat popups
export function FloatingGroupChats() {
  const { activeGroupChats } = useMessenger();
  const pathname = usePathname();
  if (activeGroupChats.length === 0 || pathname === "/messages") return null;
  return (
    <>
      {activeGroupChats.map((group, i) => (
        <GroupChatPopup key={group.id} group={group} index={i} />
      ))}
    </>
  );
}
