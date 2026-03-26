"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, MoreHorizontal, Edit, Phone, Video, Info, 
  Send, ThumbsUp, Smile, Image as ImageIcon, 
  User as UserIcon, Share2, BellOff, ShieldAlert,
  ChevronLeft, Loader2, Users
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useChatHistory, useMarkMessagesRead, useSendMessage } from "@/hooks/use-messages";
import { useSocket } from "@/components/socket-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMessenger } from "./messenger-context";

export function ChatInterface() {
  const { user: currentUser } = useAuth();
  const { 
    openGroupModal, initiateCall, groups, openGroupChat, 
    selectedChatId, setSelectedChatId, perUserData
  } = useMessenger();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const urlUserId = searchParams.get("userId");
  const urlGroupId = searchParams.get("groupId");
  
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync URL params to global context
  useEffect(() => {
    if (urlUserId) setSelectedChatId(urlUserId);
    else if (urlGroupId) setSelectedChatId(urlGroupId);
  }, [urlUserId, urlGroupId, setSelectedChatId]);

  const { data: users, isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiClient.get("/users");
      return res.data.data.filter((u: any) => u.id !== currentUser?.id);
    },
    enabled: !!currentUser,
  });

  // Fix group selection logic to match actual groups array instead of string prefix
  const isGroupSelected = groups.some(g => g.id === selectedChatId);
  const { data: messages, isLoading: isLoadingMessages } = useChatHistory(!isGroupSelected ? (selectedChatId || "") : "");
  
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: markAsRead } = useMarkMessagesRead();

  // Sort users so that those with recent messages appear at the very top
  const sortedUsers = [...(users || [])].sort((a, b) => {
    const timeA = perUserData[a.id]?.lastMessageTime ? new Date(perUserData[a.id].lastMessageTime!).getTime() : 0;
    const timeB = perUserData[b.id]?.lastMessageTime ? new Date(perUserData[b.id].lastMessageTime!).getTime() : 0;
    return timeB - timeA;
  });

  const filteredUsers = sortedUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = !isGroupSelected ? users?.find((u) => u.id === selectedChatId) : null;
  const selectedGroup = isGroupSelected ? groups.find((g) => g.id === selectedChatId) : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedChatId]);

  const handleSelectChat = (id: string, isGroup: boolean) => {
    setSelectedChatId(id);
    if (isGroup) {
      router.push(`/messages?groupId=${id}`, { scroll: false });
    } else {
      router.push(`/messages?userId=${id}`, { scroll: false });
    }
  };

  const handleCall = (video: boolean) => {
    if (selectedUser) initiateCall(selectedUser, video);
    else if (selectedGroup) toast.info("Group calls coming soon!");
  };

  useEffect(() => {
    if (!socket || !selectedChatId || isGroupSelected) return;

    socket.emit("check-online", { userId: selectedChatId }, (res: { online: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (res.online) next.add(selectedChatId);
        else next.delete(selectedChatId);
        return next;
      });
    });

    const handleUserStatus = (data: { userId: string; status: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.status === "online") next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    };

    const handleTyping = (data: { from: string }) => {
      if (data.from === selectedChatId) setIsTyping(true);
    };
    const handleStopTyping = (data: { from: string }) => {
      if (data.from === selectedChatId) setIsTyping(false);
    };
    const handleNewMessage = (msg: any) => {
      if (
        (msg.senderId === selectedChatId && msg.receiverId === currentUser?.id) ||
        (msg.senderId === currentUser?.id && msg.receiverId === selectedChatId)
      ) {
        queryClient.setQueryData(["messages", selectedChatId], (oldData: any[]) => {
          if (!oldData) return [msg];
          if (oldData.some((m) => m.id === msg.id)) return oldData;
          return [...oldData, msg];
        });
        if (msg.senderId === selectedChatId) markAsRead(selectedChatId);
      }
    };

    socket.on("user-status", handleUserStatus);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);
    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("user-status", handleUserStatus);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, selectedChatId, isGroupSelected, queryClient, currentUser, markAsRead]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (socket && selectedChatId && !isGroupSelected) {
      socket.emit("typing", { to: selectedChatId });
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => {
        socket.emit("stop-typing", { to: selectedChatId });
      }, 2000);
      setTypingTimeout(timeout);
    }
  };

  const handleSend = () => {
    if (!messageInput.trim() || !selectedChatId) return;
    if (isGroupSelected) {
        toast.info("Group messaging coming soon!");
        setMessageInput("");
        return;
    }
    sendMessage({ receiverId: selectedChatId, content: messageInput });
    setMessageInput("");
    if (socket) socket.emit("stop-typing", { to: selectedChatId });
  };

  const handleSendLike = () => {
    if (!selectedChatId) return;
    if (isGroupSelected) {
        toast.info("Group reactions coming soon!");
        return;
    }
    sendMessage({ receiverId: selectedChatId, content: "👍" });
  };

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div className="w-full flex h-[calc(100vh-56px-72px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background">

      {/* ── LEFT COLUMN: Chat List ── */}
      <div className={cn(
        "w-full md:w-[320px] lg:w-[360px] shrink-0 flex flex-col border-r border-border/10 bg-card/60 backdrop-blur-xl transition-all duration-300",
        selectedChatId ? "hidden md:flex" : "flex"
      )}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-tight">Chats</h1>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-9 w-9 bg-muted/60 hover:bg-muted text-foreground"
              onClick={openGroupModal}
              title="New Group Chat"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/60 hover:bg-muted text-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/60 hover:bg-muted text-foreground">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search Messenger"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/60 border-0 shadow-none rounded-full h-9 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:bg-muted"
            />
          </div>
        </div>

        {/* User & Group List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-2 pb-2 space-y-0.5">
            {isLoadingUsers ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Groups Section */}
                {filteredGroups.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1">Groups</p>
                    {filteredGroups.map(g => (
                      <button
                        key={g.id}
                        onClick={() => handleSelectChat(g.id, true)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/70 transition-all text-left group",
                          selectedChatId === g.id && "bg-primary/10"
                        )}
                      >
                         <div className="relative shrink-0">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                         </div>
                         <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-sm text-foreground truncate">{g.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{g.members.length} members</p>
                         </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Users Section */}
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1">Direct Messages</p>
                {filteredUsers?.map((u) => (
                  <div key={u.id} className="relative group/user">
                    <button
                      onClick={() => handleSelectChat(u.id, false)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/70 transition-all text-left",
                        selectedChatId === u.id && "bg-primary/10"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={u.image} alt={u.name} />
                          <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                            {u.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {onlineUsers.has(u.id) && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-card" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="font-semibold text-sm text-foreground truncate">{u.name}</p>
                          {perUserData[u.id]?.lastMessageTime && (
                            <span className="text-[10px] text-muted-foreground/60 shrink-0 ml-2">
                              {format(new Date(perUserData[u.id].lastMessageTime!), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className="text-xs text-muted-foreground truncate flex-1">
                            {perUserData[u.id]?.lastMessage 
                              ? (
                                <span className={perUserData[u.id]?.unreadCount > 0 ? "font-semibold text-foreground/80" : ""}>
                                  {perUserData[u.id].lastMessage}
                                </span>
                              )
                              : onlineUsers.has(u.id) ? "Active now" : "Click to message"
                            }
                          </p>
                          {(perUserData[u.id]?.unreadCount ?? 0) > 0 && (
                            <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                              {perUserData[u.id].unreadCount > 9 ? "9+" : perUserData[u.id].unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </>
            )}
            {!isLoadingUsers && filteredUsers?.length === 0 && filteredGroups.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">No chats found</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ── RIGHT COLUMN: Conversation Area ── */}
      <div className={cn(
        "flex-1 flex flex-col bg-card/20 min-w-0 transition-all duration-300",
        !selectedChatId && "hidden md:flex"
      )}>
        {(selectedUser || selectedGroup) ? (
          <>
            {/* Header */}
            <div className="h-16 shrink-0 border-b border-border/10 flex items-center justify-between px-4 bg-background/50 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden -ml-2 rounded-full"
                  onClick={() => setSelectedChatId(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="relative">
                  {selectedUser ? (
                    <>
                      <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
                        <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {selectedUser.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {onlineUsers.has(selectedUser.id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-background" />
                      )}
                    </>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/10 shadow-sm">
                       <Users className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-sm text-foreground truncate leading-tight">
                    {selectedUser ? selectedUser.name : selectedGroup?.name}
                  </h2>
                  <p className="text-[10px] text-muted-foreground/70 font-medium">
                    {selectedUser ? (
                        isTyping ? <span className="text-primary animate-pulse">typing...</span> : "Active Messenger"
                    ) : (
                        `${selectedGroup?.members.length} members`
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9 bg-muted/50 hover:bg-primary/10 text-primary"
                  onClick={() => handleCall(false)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9 bg-muted/50 hover:bg-primary/10 text-primary"
                  onClick={() => handleCall(true)}
                >
                  <Video className="h-4.5 w-4.5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/50 hover:bg-primary/10 text-primary">
                      <Info className="h-4.5 w-4.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => {
                        if (selectedUser) router.push(`/profile/${selectedUser.id}`);
                        else toast.info("Group details coming soon");
                    }}>
                      {selectedUser ? <UserIcon className="mr-2 h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />}
                      {selectedUser ? "View Profile" : "Group Members"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                       const id = selectedUser ? selectedUser.id : selectedGroup?.id;
                       navigator.clipboard.writeText(`${window.location.origin}/messages?userId=${id}`);
                       toast.success("Link copied!");
                    }}>
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <ShieldAlert className="mr-2 h-4 w-4" /> {selectedUser ? "Block User" : "Leave Group"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="flex flex-col gap-1 p-4">
                <div className="flex flex-col items-center gap-3 py-10 mb-4 border-b border-border/5">
                  {selectedUser ? (
                    <Avatar className="h-24 w-24 ring-4 ring-primary/10 shadow-xl">
                      <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-3xl">
                        {selectedUser.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/10 shadow-xl">
                       <Users className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-foreground tracking-tight">
                        {selectedUser ? selectedUser.name : selectedGroup?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                        {selectedUser ? "EchoNet • Active on Messenger" : `${selectedGroup?.members.length} members`}
                    </p>
                  </div>
                </div>

                {selectedUser ? (
                  isLoadingMessages ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
                    </div>
                  ) : (
                    messages?.map((msg: any, idx: number) => {
                      const isMe = msg.senderId === currentUser?.id;
                      const prevMsg = messages[idx - 1];
                      const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;

                      return (
                        <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start", isFirstInGroup ? "mt-4" : "mt-0.5")}>
                          <div className={cn("max-w-[80%] flex items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                            {!isMe && isFirstInGroup ? (
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src={selectedUser.image} />
                                <AvatarFallback className="text-[10px]">{selectedUser.name[0]}</AvatarFallback>
                              </Avatar>
                            ) : !isMe ? (
                              <div className="w-7 shrink-0" />
                            ) : null}
                            <div className={cn(
                              "px-4 py-2 text-[14px] leading-snug wrap-break",
                              isMe ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" : "bg-muted text-foreground rounded-2xl rounded-tl-sm shadow-sm"
                            )}>
                              {msg.content}
                            </div>
                          </div>
                          {idx === messages.length - 1 && (
                            <span className="text-[9px] text-muted-foreground/50 mt-1 px-1">{format(new Date(msg.createdAt), "p")}</span>
                          )}
                        </div>
                      );
                    })
                  )
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">Start the group conversation!</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-2">
                        {selectedGroup?.members.map(m => m.name.split(" ")[0]).join(", ")}
                    </p>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input area */}
            <div className="p-4 bg-background/50 backdrop-blur-md border-t border-border/10">
              <div className="flex items-center gap-2 max-w-4xl mx-auto">
                <div className="flex items-center gap-1 mr-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10">
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 relative">
                  <Input
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Aa"
                    className="h-10 bg-muted/60 border-0 rounded-full pl-4 pr-10 shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                </div>
                {messageInput.trim() ? (
                  <Button 
                    size="icon" 
                    className="h-10 w-10 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                    onClick={handleSend}
                  >
                    <Send className="h-4.5 w-4.5" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full text-primary hover:bg-primary/10 transition-all hover:scale-110 active:scale-95"
                    onClick={handleSendLike}
                  >
                    <ThumbsUp className="h-5 w-5 fill-current" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background/20">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Select a chat</h2>
            <p className="text-muted-foreground mt-2 text-center max-w-xs">
              Pick a friend or group from the list to start messaging. Your chats are synced across devices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
