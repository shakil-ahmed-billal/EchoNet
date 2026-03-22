"use client";

import { useSocket } from "@/components/socket-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import {
  useChatHistory,
  useMarkMessagesRead,
  useSendMessage,
} from "@/hooks/use-messages";
import { useWebRTC } from "@/hooks/use-webrtc";
import { apiClient } from "@/services/api-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Check,
  CheckCheck,
  Edit,
  Loader2,
  MoreHorizontal,
  Phone,
  Search,
  Send,
  Video,
  X,
  MessagesSquare,
  Image as ImageIcon,
  ThumbsUp,
  Info,
  Bell,
  Shield,
  FileText,
  ChevronDown,
  ChevronRight,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const { user: currentUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiClient.get("/users");
      return response.data.data.filter((u: any) => u.id !== currentUser?.id);
    },
    enabled: !!currentUser,
  });

  const { data: messages, isLoading: isLoadingMessages } = useChatHistory(
    selectedUserId || "",
  );
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: markAsRead } = useMarkMessagesRead();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const { localStream, remoteStream, startCall, handleIncomingCall } = useWebRTC();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  const filteredUsers = users?.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);
  useEffect(() => {
    const onAnswer = (e: any) => { handleIncomingCall(e.detail); };
    window.addEventListener("answer-call", onAnswer);
    return () => window.removeEventListener("answer-call", onAnswer);
  }, [handleIncomingCall]);

  useEffect(() => {
    if (!socket || !selectedUserId) return;

    socket.emit("check-online", { userId: selectedUserId }, (res: { online: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (res.online) next.add(selectedUserId);
        else next.delete(selectedUserId);
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
      if (data.from === selectedUserId) setIsTyping(true);
    };
    const handleStopTyping = (data: { from: string }) => {
      if (data.from === selectedUserId) setIsTyping(false);
    };
    const handleMessagesRead = (data: { by: string }) => {
      if (data.by === selectedUserId) {
        queryClient.invalidateQueries({ queryKey: ["messages", selectedUserId] });
      }
    };
    const handleNewMessage = (msg: any) => {
      if (
        (msg.senderId === selectedUserId && msg.receiverId === currentUser?.id) ||
        (msg.senderId === currentUser?.id && msg.receiverId === selectedUserId)
      ) {
        queryClient.setQueryData(["messages", selectedUserId], (oldData: any[]) => {
          if (!oldData) return [msg];
          if (oldData.some((m) => m.id === msg.id)) return oldData;
          return [...oldData, msg];
        });
        if (msg.senderId === selectedUserId) markAsRead(selectedUserId);
      }
    };

    socket.on("user-status", handleUserStatus);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);
    socket.on("messages-read", handleMessagesRead);
    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("user-status", handleUserStatus);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
      socket.off("messages-read", handleMessagesRead);
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, selectedUserId, queryClient, currentUser, markAsRead]);

  useEffect(() => {
    if (messages && messages.length > 0 && selectedUserId) {
      const hasUnread = messages.some(
        (m: any) => m.senderId === selectedUserId && !m.isRead
      );
      if (hasUnread) markAsRead(selectedUserId);
    }
  }, [messages, selectedUserId, markAsRead]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (socket && selectedUserId) {
      socket.emit("typing", { to: selectedUserId });
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => {
        socket.emit("stop-typing", { to: selectedUserId });
      }, 2000);
      setTypingTimeout(timeout);
    }
  };

  const handleSend = () => {
    if (!messageInput.trim() || !selectedUserId) return;
    sendMessage({ receiverId: selectedUserId, content: messageInput });
    setMessageInput("");
    if (socket) socket.emit("stop-typing", { to: selectedUserId });
  };

  const handleSendLike = () => {
    if (!selectedUserId) return;
    sendMessage({ receiverId: selectedUserId, content: "👍" });
  };

  return (
    <div className="w-full flex h-[calc(100vh-64px)] overflow-hidden bg-background">

      {/* ── LEFT COLUMN: Chat List ── */}
      <div className="w-[340px] shrink-0 flex flex-col border-r border-border/10 bg-card/60 backdrop-blur-xl">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h1 className="text-[22px] font-black tracking-tight">Chats</h1>
          <div className="flex items-center gap-1">
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

        {/* User List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-2 pb-2 space-y-0.5">
            {isLoadingUsers ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              filteredUsers?.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/70 transition-all text-left",
                    selectedUserId === u.id && "bg-primary/10"
                  )}
                >
                  {/* Avatar with online dot */}
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
                  {/* User info */}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-sm text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {onlineUsers.has(u.id) ? "Active now" : "Click to message"}
                    </p>
                  </div>
                </button>
              ))
            )}
            {!isLoadingUsers && filteredUsers?.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">No chats found</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ── MIDDLE COLUMN: Chat Window ── */}
      <div className="flex flex-col flex-1 min-w-0 bg-background">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/10 bg-card/40 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                      {selectedUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(selectedUser.id) && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-card" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{selectedUser.name}</p>
                  <p className="text-[11px] text-green-500 font-medium">
                    {isTyping ? "typing..." : onlineUsers.has(selectedUser.id) ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 bg-muted/50 hover:bg-primary/10 text-primary"
                  onClick={() => startCall(selectedUser.id)}
                >
                  <Phone className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 bg-muted/50 hover:bg-primary/10 text-primary"
                  onClick={() => startCall(selectedUser.id)}
                >
                  <Video className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 bg-muted/50 hover:bg-primary/10 text-primary"
                >
                  <Info className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>

            {/* Video Call Area */}
            {(localStream || remoteStream) && (
              <div className="bg-black/95 p-4 border-b border-border/10 flex gap-4 h-64 shrink-0 justify-center items-center relative overflow-hidden">
                {remoteStream && (
                  <video ref={remoteVideoRef} autoPlay playsInline className="h-full rounded-2xl bg-black" />
                )}
                <div className={`${remoteStream ? "absolute bottom-4 right-4 h-24" : "h-full"} rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted/10 shadow-xl`}>
                  <video ref={localVideoRef} autoPlay playsInline muted className="h-full" />
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-4 right-4 rounded-full shadow-lg"
                  onClick={() => window.location.reload()}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="flex flex-col gap-1 p-4">
                {/* Profile intro at top */}
                <div className="flex flex-col items-center gap-2 py-10 mb-4">
                  <Avatar className="h-20 w-20 ring-4 ring-border/20">
                    <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">
                      {selectedUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-lg">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground">EchoNet</p>
                </div>

                {isLoadingMessages ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {messages?.map((msg, idx) => {
                      const isMe = msg.senderId === currentUser?.id;
                      const prevMsg = messages[idx - 1];
                      const isFirst = !prevMsg || prevMsg.senderId !== msg.senderId;
                      const nextMsg = messages[idx + 1];
                      const isLast = !nextMsg || nextMsg.senderId !== msg.senderId;

                      return (
                        <div key={msg.id} className={cn("flex items-end gap-1.5 group", isMe ? "justify-end" : "justify-start", isFirst ? "mt-3" : "mt-0.5")}>
                          {/* Avatar for other user */}
                          {!isMe && (
                            <div className="w-7 shrink-0">
                              {isLast && (
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                                  <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                                    {selectedUser.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )}

                          <div className={cn("flex flex-col max-w-[65%]", isMe ? "items-end" : "items-start")}>
                            <div
                              className={cn(
                                "px-4 py-2.5 text-sm leading-relaxed",
                                isMe
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/80 text-foreground",
                                // Bubble shaping
                                isMe && isFirst && "rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md",
                                isMe && !isFirst && !isLast && "rounded-tl-2xl rounded-bl-2xl rounded-tr-md rounded-br-md",
                                isMe && isLast && !isFirst && "rounded-tl-2xl rounded-bl-2xl rounded-tr-md rounded-br-2xl",
                                isMe && isFirst && isLast && "rounded-2xl",
                                !isMe && isFirst && "rounded-tr-2xl rounded-tl-md rounded-br-2xl rounded-bl-2xl",
                                !isMe && !isFirst && !isLast && "rounded-tr-2xl rounded-br-2xl rounded-tl-md rounded-bl-md",
                                !isMe && isLast && !isFirst && "rounded-tr-2xl rounded-tl-md rounded-bl-2xl rounded-br-2xl",
                                !isMe && isFirst && isLast && "rounded-2xl",
                              )}
                            >
                              {msg.content}
                            </div>

                            {/* Timestamp + read receipt: only on last message */}
                            {isLast && (
                              <div className={cn("flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity", isMe ? "flex-row-reverse" : "flex-row")}>
                                <span className="text-[10px] text-muted-foreground">
                                  {format(new Date(msg.createdAt), "p")}
                                </span>
                                {isMe && (
                                  msg.isRead
                                    ? <CheckCheck className="h-3 w-3 text-primary" />
                                    : <Check className="h-3 w-3 text-muted-foreground/50" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="flex items-end gap-1.5 mt-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                            {selectedUser.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted/80 rounded-2xl px-4 py-3 flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    )}

                    {!isLoadingMessages && messages?.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm font-medium text-muted-foreground">Say hi to {selectedUser.name}!</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Start the conversation.</p>
                      </div>
                    )}
                  </>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Message Input Footer */}
            <div className="px-4 py-3 bg-card/40 backdrop-blur-sm border-t border-border/10 shrink-0">
              <div className="flex items-center gap-2">
                {/* Left icons */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-primary hover:bg-primary/10 shrink-0">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </div>

                {/* Input */}
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Aa"
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="rounded-full bg-muted/60 border-0 shadow-none focus-visible:ring-0 h-9 pl-4 pr-4 text-sm placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Right side: Send or Like */}
                {messageInput.trim() ? (
                  <Button
                    size="icon"
                    className="rounded-full h-9 w-9 shrink-0 bg-primary hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 shadow-md shadow-primary/20"
                    onClick={handleSend}
                    disabled={isSending}
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9 shrink-0 text-primary hover:bg-primary/10 transition-all hover:scale-110 active:scale-95"
                    onClick={handleSendLike}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="size-24 rounded-full bg-muted/40 flex items-center justify-center mb-6 ring-4 ring-border/10">
              <MessagesSquare className="size-12 text-muted-foreground/30" />
            </div>
            <p className="font-bold text-xl text-foreground">Your Messages</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">Send private photos and messages to a friend or group.</p>
            <Button className="mt-6 rounded-full px-6" onClick={() => {}}>
              Send message
            </Button>
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN: Chat Details (visible when chat selected) ── */}
      {selectedUser && (
        <div className="hidden xl:flex w-[280px] shrink-0 flex-col border-l border-border/10 bg-card/40 backdrop-blur-xl overflow-y-auto">
          {/* Profile */}
          <div className="flex flex-col items-center pt-8 pb-5 px-4 gap-2">
            <Avatar className="h-20 w-20 ring-4 ring-border/10">
              <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">
                {selectedUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-bold text-base">{selectedUser.name}</h2>
            {onlineUsers.has(selectedUser.id) && (
              <p className="text-xs text-green-500 font-medium">Active now</p>
            )}
            <div className="flex items-center gap-4 mt-1">
              <div className="flex flex-col items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/60 hover:bg-muted text-foreground">
                  <Phone className="h-4 w-4" />
                </Button>
                <span className="text-[10px] text-muted-foreground font-medium">Audio</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/60 hover:bg-muted text-foreground">
                  <Video className="h-4 w-4" />
                </Button>
                <span className="text-[10px] text-muted-foreground font-medium">Video</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/60 hover:bg-muted text-foreground">
                  <Search className="h-4 w-4" />
                </Button>
                <span className="text-[10px] text-muted-foreground font-medium">Search</span>
              </div>
            </div>
          </div>

          {/* Accordion Options */}
          <div className="px-3 pb-6 space-y-1">
            {[
              { icon: Info, label: "Chat info" },
              { icon: Bell, label: "Notifications & sounds" },
              { icon: Shield, label: "Privacy & support" },
              { icon: FileText, label: "Shared files" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-muted/60 transition-all group"
              >
                <span className="text-sm font-semibold">{label}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
