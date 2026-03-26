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
import { CallModal } from "./call-modal";
import { FloatingCallIndicator } from "./floating-call-indicator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
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
  ChevronLeft,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ChatInterface() {
  const { user: currentUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlUserId = searchParams.get("userId");
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(urlUserId || null);

  useEffect(() => {
    if (urlUserId && urlUserId !== selectedUserId) {
      setSelectedUserId(urlUserId);
    }
  }, [urlUserId]);
  
  const handleSelectUser = (id: string) => {
    setSelectedUserId(id || null);
    if (id) {
      router.replace(`/messages?userId=${id}`, { scroll: false });
    } else {
      router.replace("/messages", { scroll: false });
    }
  };
  
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
  const [mounted, setMounted] = useState(false);

  // Call State Management
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [currentCallUser, setCurrentCallUser] = useState<any>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(false);

  const { localStream, remoteStream, error: callError, startCall: startWebRTCCall, handleIncomingCall: handleWebRTCIncomingCall, endCall: endWebRTCCall, clearError } = useWebRTC(() => {
    // When remote ends the call
    setIsCallActive(false);
    setIsCallMinimized(false);
    setCurrentCallUser(null);
    setIsRinging(false);
    setCallDuration(0);
  });

  useEffect(() => {
    setMounted(true);
  }, []);
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
    if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        setIsRinging(false);
    }
  }, [remoteStream]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && remoteStream) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive, remoteStream]);

  useEffect(() => {
    const ringAudio = new Audio("/sounds/ringing.mp3"); // Assuming sound exists
    if (isRinging) {
      ringAudio.loop = true;
      ringAudio.play().catch(e => console.warn("Audio play failed:", e));
    } else {
      ringAudio.pause();
    }
    return () => ringAudio.pause();
  }, [isRinging]);
  useEffect(() => {
    if (callError) {
      toast.error(callError);
      clearError();
    }
  }, [callError, clearError]);
  useEffect(() => {
    const onAnswer = (e: any) => { 
      handleWebRTCIncomingCall(e.detail);
      setCurrentCallUser(users?.find(u => u.id === e.detail.from));
      setIsVideoCall(e.detail.isVideo !== false);
      setIsCallActive(true);
      setIsCallMinimized(false);
      setIsRinging(false);
    };
    window.addEventListener("answer-call", onAnswer);
    return () => window.removeEventListener("answer-call", onAnswer);
  }, [handleWebRTCIncomingCall, users]);

  const handleStartCall = (userId: string, video: boolean) => {
    startWebRTCCall(userId, video);
    setCurrentCallUser(users?.find(u => u.id === userId));
    setIsVideoCall(video);
    setIsCallActive(true);
    setIsCallMinimized(false);
    setIsRinging(true);
  };

  const handleEndCall = () => {
    if (currentCallUser) {
        endWebRTCCall(currentCallUser.id);
        
        // Log call to chat
        const minutes = Math.floor(callDuration / 60);
        const seconds = callDuration % 60;
        const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        sendMessage({ 
            receiverId: currentCallUser.id, 
            content: `📞 Call ended. Duration: ${durationStr}` 
        });
    } else {
        endWebRTCCall();
    }
    
    setIsCallActive(false);
    setIsCallMinimized(false);
    setCurrentCallUser(null);
    setIsRinging(false);
    setCallDuration(0);
  };

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
    <div className="w-full flex h-[calc(100vh-56px-72px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background">

      {/* ── LEFT COLUMN: Chat List ── */}
      <div className={cn(
        "w-full md:w-[320px] lg:w-[360px] shrink-0 flex flex-col border-r border-border/10 bg-card/60 backdrop-blur-xl transition-all duration-300",
        selectedUserId ? "hidden md:flex" : "flex"
      )}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-tight">Chats</h1>
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
                  onClick={() => handleSelectUser(u.id)}
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
      <div className={cn(
        "flex flex-col flex-1 min-w-0 bg-background transition-all duration-300",
        !selectedUserId ? "hidden md:flex" : "flex"
      )}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-2 md:px-4 py-2 md:py-2.5 border-b border-border/10 bg-card/40 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-1 md:gap-3">
                {/* Back button on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full text-primary"
                  onClick={() => handleSelectUser("")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="flex items-center gap-3 active:bg-muted/50 p-1 rounded-lg cursor-pointer transition-colors">
                  <div className="relative">
                    <Avatar className="h-9 w-9 md:h-10 md:w-10">
                      <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                        {selectedUser.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUsers.has(selectedUser.id) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-card" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[14px] md:text-sm text-foreground truncate">{selectedUser.name}</p>
                    <p className="text-[10px] md:text-[11px] text-muted-foreground font-medium">
                      {isTyping ? "typing..." : onlineUsers.has(selectedUser.id) ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 bg-muted/50 hover:bg-primary/10 text-primary"
                  onClick={() => handleStartCall(selectedUser.id, false)}
                >
                  <Phone className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 bg-muted/50 hover:bg-primary/10 text-primary"
                  onClick={() => handleStartCall(selectedUser.id, true)}
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

            {/* Modal replaced old video area */}
            {mounted && (
              <>
                <CallModal 
                  isOpen={isCallActive && !isCallMinimized}
                  onClose={handleEndCall}
                  onMinimize={() => setIsCallMinimized(true)}
                  remoteUser={currentCallUser}
                  isVideo={isVideoCall}
                  localStream={localStream}
                  remoteStream={remoteStream}
                  localVideoRef={localVideoRef}
                  remoteVideoRef={remoteVideoRef}
                  duration={callDuration}
                />

                <FloatingCallIndicator 
                  remoteUser={currentCallUser}
                  isVisible={isCallActive && isCallMinimized}
                  onClick={() => setIsCallMinimized(false)}
                />
              </>
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

            {/* Message Input Footer - Pinned to bottom */}
            <div className="px-4 py-3 bg-card/40 backdrop-blur-sm border-t border-border/10 shrink-0 mt-auto">
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
                    variant="ghost"
                    className="rounded-full h-9 w-9 shrink-0 text-primary hover:bg-primary/10 transition-all hover:scale-110 active:scale-95"
                    onClick={handleSend}
                    disabled={isSending}
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-5 w-5 fill-current" />}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9 shrink-0 text-primary hover:bg-primary/10 transition-all hover:scale-110 active:scale-95"
                    onClick={handleSendLike}
                  >
                    <ThumbsUp className="h-5 w-5 fill-current" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card/20">
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-8 ring-primary/5">
              <MessagesSquare className="size-12 text-primary/40" />
            </div>
            <p className="font-bold text-2xl text-foreground tracking-tight">Select a Chat</p>
            <p className="text-[15px] text-muted-foreground mt-2 max-w-[260px] leading-relaxed">Choose from your existing conversations or start a new one.</p>
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9 bg-muted/60 hover:bg-muted text-foreground"
                  onClick={() => handleStartCall(selectedUser.id, false)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <span className="text-[10px] text-muted-foreground font-medium">Audio</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9 bg-muted/60 hover:bg-muted text-foreground"
                  onClick={() => handleStartCall(selectedUser.id, true)}
                >
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
