"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useSocket } from "@/components/socket-provider";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/services/api-client";
import { useRouter, usePathname } from "next/navigation";

export interface ChatUser {
  id: string;
  name: string;
  avatarUrl?: string;
  image?: string;
}

export type ChatState = "open" | "minimized";

export interface ActiveChat {
  user: ChatUser;
  state: ChatState;
}

export interface GroupChat {
  id: string;
  name: string;
  members: ChatUser[];
  state: ChatState;
}

export interface PerUserData {
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string | null;
}

export type CallStatus = "idle" | "incoming" | "outgoing" | "active";

interface MessengerContextValue {
  // drawer
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // group chat modal
  isGroupModalOpen: boolean;
  openGroupModal: () => void;
  closeGroupModal: () => void;

  // Global Chat Selection (Unified)
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;

  // 1:1 floating chats
  activeChats: ActiveChat[];
  openChat: (user: ChatUser) => void;
  closeChat: (userId: string) => void;
  minimizeChat: (userId: string) => void;
  restoreChat: (userId: string) => void;

  // group chats
  groups: GroupChat[]; // Persistent list for current session
  activeGroupChats: GroupChat[];
  addGroup: (group: Omit<GroupChat, "state">) => void;
  openGroupChat: (group: Omit<GroupChat, "state">) => void;
  closeGroupChat: (groupId: string) => void;
  minimizeGroupChat: (groupId: string) => void;
  restoreGroupChat: (groupId: string) => void;

  // unread counts
  totalUnread: number;
  perUserData: Record<string, PerUserData>;
  markUserRead: (userId: string) => void;

  // Global Call State
  callStatus: CallStatus;
  callUser: ChatUser | null;
  isVideoCall: boolean;
  callIsMinimized: boolean;
  initiateCall: (user: ChatUser, isVideo: boolean) => void;
  receiveCall: (user: ChatUser, isVideo: boolean) => void;
  acceptCall: () => void;
  declineCall: () => void;
  terminateCall: () => void;
  setCallMinimized: (min: boolean) => void;
}

const MessengerContext = createContext<MessengerContextValue | null>(null);

export function MessengerProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
  const [activeGroupChats, setActiveGroupChats] = useState<GroupChat[]>([]);
  const [groups, setGroups] = useState<GroupChat[]>([]);

  // Call State
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callUser, setCallUser] = useState<ChatUser | null>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [callIsMinimized, setCallIsMinimized] = useState(false);

  // ── Unread tracking ────────────────────────────────────────────────────
  const [totalUnread, setTotalUnread] = useState(0);
  const [perUserData, setPerUserData] = useState<Record<string, PerUserData>>({});

  useEffect(() => {
    if (!currentUser) return;
    const fetchInitial = async () => {
      try {
        const usersRes = await apiClient.get("/users");
        const users: any[] = usersRes.data?.data ?? [];
        setTotalUnread(0);
        setPerUserData({});
      } catch { /* skip */ }
    };
    fetchInitial();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!socket || !currentUser) return;
    const onNewMessage = (msg: any) => {
      if (msg.receiverId !== currentUser.id) return;
      const senderId = msg.senderId;
      const chatIsOpen = activeChats.some((c) => c.user.id === senderId && c.state === "open");
      if (chatIsOpen) return;
      setPerUserData((prev) => {
        const ex = prev[senderId] ?? { unreadCount: 0, lastMessage: "", lastMessageTime: null };
        return { ...prev, [senderId]: { unreadCount: ex.unreadCount + 1, lastMessage: msg.content, lastMessageTime: msg.createdAt } };
      });
      setTotalUnread((t) => t + 1);
    };
    socket.on("new-message", onNewMessage);
    return () => { socket.off("new-message", onNewMessage); };
  }, [socket, currentUser, activeChats]);

  const markUserRead = useCallback((userId: string) => {
    setPerUserData((prev) => {
      const count = prev[userId]?.unreadCount ?? 0;
      if (count === 0) return prev;
      setTotalUnread((t) => Math.max(0, t - count));
      return { ...prev, [userId]: { ...prev[userId], unreadCount: 0 } };
    });
    apiClient.patch(`/messages/${userId}/read`, {}).catch(() => {});
  }, []);

  // ── Call Actions ───────────────────────────────────────────────────────
  const initiateCall = useCallback((user: ChatUser, isVideo: boolean) => {
    setCallUser(user);
    setIsVideoCall(isVideo);
    setCallStatus("outgoing");
    setCallIsMinimized(false);
  }, []);

  const receiveCall = useCallback((user: ChatUser, isVideo: boolean) => {
    setCallUser(user);
    setIsVideoCall(isVideo);
    setCallStatus("incoming");
    setCallIsMinimized(false);
  }, []);

  const acceptCall = useCallback(() => setCallStatus("active"), []);
  const declineCall = useCallback(() => setCallStatus("idle"), []);
  const terminateCall = useCallback(() => setCallStatus("idle"), []);
  const setCallMinimized = useCallback((min: boolean) => setCallIsMinimized(min), []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((v) => !v), []);
  const openGroupModal = useCallback(() => { setIsGroupModalOpen(true); setIsDrawerOpen(false); }, []);
  const closeGroupModal = useCallback(() => setIsGroupModalOpen(false), []);

  // ── 1:1 chats ──────────────────────────────────────────────────────────
  const openChat = useCallback((user: ChatUser) => {
    if (pathname === "/messages") {
      setSelectedChatId(user.id);
      setIsDrawerOpen(false);
      markUserRead(user.id);
      router.push(`/messages?userId=${user.id}`, { scroll: false });
      return;
    }

    setActiveChats((prev) => {
      const exists = prev.find((c) => c.user.id === user.id);
      if (exists) return prev.map((c) => c.user.id === user.id ? { ...c, state: "open" } : c);
      const limited = prev.length >= 3 ? prev.slice(1) : prev;
      return [...limited, { user, state: "open" }];
    });
    setIsDrawerOpen(false);
    markUserRead(user.id);
  }, [pathname, router, markUserRead]);

  const closeChat = useCallback((userId: string) => setActiveChats((prev) => prev.filter((c) => c.user.id !== userId)), []);
  const minimizeChat = useCallback((userId: string) => setActiveChats((prev) => prev.map((c) => c.user.id === userId ? { ...c, state: "minimized" } : c)), []);
  const restoreChat = useCallback((userId: string) => { setActiveChats((prev) => prev.map((c) => c.user.id === userId ? { ...c, state: "open" } : c)); markUserRead(userId); }, [markUserRead]);

  // ── Group chats ────────────────────────────────────────────────────────
  const addGroup = useCallback((group: Omit<GroupChat, "state">) => {
    setGroups(prev => [...prev, { ...group, state: "minimized" }]);
  }, []);

  const openGroupChat = useCallback((group: Omit<GroupChat, "state">) => {
    if (pathname === "/messages") {
      setSelectedChatId(group.id);
      setIsGroupModalOpen(false);
      setIsDrawerOpen(false);
      router.push(`/messages?groupId=${group.id}`, { scroll: false });
      return;
    }

    setActiveGroupChats((prev) => {
      const exists = prev.find((g) => g.id === group.id);
      if (exists) return prev.map((g) => g.id === group.id ? { ...g, state: "open" } : g);
      const limited = prev.length >= 2 ? prev.slice(1) : prev;
      return [...limited, { ...group, state: "open" }];
    });
    setGroups(prev => {
      if (prev.find(g => g.id === group.id)) return prev;
      return [...prev, { ...group, state: "minimized" }];
    });
    setIsGroupModalOpen(false);
    setIsDrawerOpen(false);
  }, [pathname, router]);

  const closeGroupChat = useCallback((groupId: string) => setActiveGroupChats((prev) => prev.filter((g) => g.id !== groupId)), []);
  const minimizeGroupChat = useCallback((groupId: string) => setActiveGroupChats((prev) => prev.map((g) => g.id === groupId ? { ...g, state: "minimized" } : g)), []);
  const restoreGroupChat = useCallback((groupId: string) => setActiveGroupChats((prev) => prev.map((g) => g.id === groupId ? { ...g, state: "open" } : g)), []);

  return (
    <MessengerContext.Provider value={{
      isDrawerOpen, openDrawer, closeDrawer, toggleDrawer,
      isGroupModalOpen, openGroupModal, closeGroupModal,
      selectedChatId, setSelectedChatId,
      activeChats, openChat, closeChat, minimizeChat, restoreChat,
      groups, activeGroupChats, addGroup, openGroupChat, closeGroupChat, minimizeGroupChat, restoreGroupChat,
      totalUnread, perUserData, markUserRead,
      callStatus, callUser, isVideoCall, callIsMinimized, initiateCall, receiveCall, acceptCall, declineCall, terminateCall, setCallMinimized
    }}>
      {children}
    </MessengerContext.Provider>
  );
}

export function useMessenger() {
  const ctx = useContext(MessengerContext);
  if (!ctx) throw new Error("useMessenger must be used inside MessengerProvider");
  return ctx;
}
