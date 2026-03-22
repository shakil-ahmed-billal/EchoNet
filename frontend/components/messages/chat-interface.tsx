"use client";

import { useSocket } from "@/components/socket-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  MoreVertical,
  Phone,
  Search,
  Send,
  Video,
  X,
  MessagesSquare,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ChatInterface() {
  const { user: currentUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

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
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const { localStream, remoteStream, startCall, handleIncomingCall } =
    useWebRTC();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    const onAnswer = (e: any) => {
      handleIncomingCall(e.detail);
    };
    window.addEventListener("answer-call", onAnswer);
    return () => window.removeEventListener("answer-call", onAnswer);
  }, [handleIncomingCall]);

  // Listen for socket events
  useEffect(() => {
    if (!socket || !selectedUserId) return;

    socket.emit(
      "check-online",
      { userId: selectedUserId },
      (res: { online: boolean }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (res.online) next.add(selectedUserId);
          else next.delete(selectedUserId);
          return next;
        });
      },
    );

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
        queryClient.invalidateQueries({
          queryKey: ["messages", selectedUserId],
        });
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

        if (msg.senderId === selectedUserId) {
          markAsRead(selectedUserId);
        }
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

  // Mark all fetched messages as read when opening a chat
  useEffect(() => {
    if (messages && messages.length > 0 && selectedUserId) {
      const hasUnread = messages.some(
        (m: any) => m.senderId === selectedUserId && !m.isRead,
      );
      if (hasUnread) {
        markAsRead(selectedUserId);
      }
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

  return (
    <div className="w-full bg-background flex h-[calc(100vh-64px)] overflow-hidden shadow-none border-t border-edge">
      {/* Users Sidebar */}
      <div className="w-full md:w-80 flex flex-col border-r border-edge h-full min-h-0 bg-card/30">
        <div className="p-4 border-b border-edge flex items-center justify-between bg-card text-card-foreground">
          <h2 className="font-semibold text-lg tracking-tight">Messages</h2>
          <Button variant="ghost" size="icon-sm" className="rounded-md">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-3 border-b border-edge">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 bg-muted/50 border-edge shadow-none rounded-md h-9 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col p-2 space-y-0.5">
            {isLoadingUsers ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              users?.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted text-left transition-all truncate border border-transparent ${
                    selectedUserId === u.id ? "bg-muted border-edge shadow-xs" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 border border-edge shrink-0">
                    <AvatarFallback className="bg-muted text-xs font-medium">
                      {u.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-sm truncate pr-2 text-foreground">
                        {u.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground truncate pr-2">
                        {onlineUsers.has(u.id) ? "Active now" : "Click to message"}
                      </span>
                    </div>
                  </div>
                  {onlineUsers.has(u.id) && (
                    <div className="size-2 rounded-full bg-success shrink-0" />
                  )}
                </button>
              ))
            )}
            {!isLoadingUsers && users?.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground font-medium opacity-50">
                No Users
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-col flex-1 h-full bg-background min-h-0">
        {selectedUser ? (
          <>
            <div className="p-3 border-b border-edge flex items-center justify-between bg-card shrink-0 h-15">
              <div className="flex items-center gap-3 px-1">
                <Avatar className="h-8 w-8 border border-edge">
                  <AvatarFallback className="text-xs">
                    {selectedUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm leading-none mb-0.5">
                    {selectedUser.name}
                  </p>
                  <div className="flex items-center gap-1.5 leading-none">
                    <div className={`w-1.5 h-1.5 rounded-full ${onlineUsers.has(selectedUser.id) ? "bg-success" : "bg-muted-foreground/30"}`}></div>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {isTyping
                        ? "typing..."
                        : onlineUsers.has(selectedUser.id)
                          ? "Online"
                          : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground rounded-md"
                  onClick={() => startCall(selectedUser.id)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground rounded-md"
                  onClick={() => startCall(selectedUser.id)}
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground rounded-md"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {(localStream || remoteStream) && (
              <div className="bg-black/95 p-4 border-b border-edge flex gap-4 h-64 shrink-0 justify-center items-center relative overflow-hidden">
                {remoteStream && (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="h-full rounded-md bg-black"
                  />
                )}
                <div
                  className={`${remoteStream ? "absolute bottom-4 right-4 h-24" : "h-full"} rounded-md overflow-hidden border border-primary/20 bg-muted/10 shadow-lg`}
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full"
                  />
                </div>
                <Button
                  size="icon-xs"
                  variant="destructive"
                  className="absolute top-4 right-4 rounded-md shadow-md"
                  onClick={() => window.location.reload()}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <ScrollArea className="flex-1 min-h-0 bg-background/50">
              <div className="flex flex-col gap-6 p-6">
                {isLoadingMessages ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  messages?.map((msg) => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} items-start gap-3`}
                      >
                        {!isMe && (
                          <Avatar className="h-7 w-7 shrink-0 border border-edge mt-0.5">
                            <AvatarFallback className="text-[9px] font-bold">
                              {selectedUser.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                          <div
                            className={`rounded-xl px-3.5 py-2 text-sm leading-relaxed shadow-xs border ${
                              isMe
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-edge text-foreground"
                            }`}
                          >
                            {msg.content}
                          </div>
                          <div
                            className={`flex items-center gap-1.5 mt-1.5 px-0.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                          >
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {format(new Date(msg.createdAt), "p")}
                            </span>
                            {isMe && (
                              <div className="flex">
                                {msg.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-primary animate-in fade-in zoom-in" />
                                ) : (
                                  <Check className="h-3 w-3 text-muted-foreground/50" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {!isLoadingMessages && messages?.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Edit className="size-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Start a conversation</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">EchoNet is encrypted and private.</p>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-card/50 border-t border-edge shrink-0">
              <div className="flex items-center gap-2 max-w-3xl mx-auto w-full">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 rounded-md bg-background border-edge shadow-none focus-visible:ring-primary h-10"
                />
                <Button
                  size="icon"
                  className="rounded-md shrink-0 h-10 w-10 transition-transform hover:scale-105 active:scale-95"
                  onClick={handleSend}
                  disabled={isSending || !messageInput.trim()}
                >
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-background">
            <div className="size-20 rounded-full bg-muted/30 border border-edge flex items-center justify-center mb-4">
               <MessagesSquare className="size-10 text-muted-foreground/20" />
            </div>
            <p className="font-semibold text-foreground">No Chat Selected</p>
            <p className="text-sm mt-1">Choose a contact to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
