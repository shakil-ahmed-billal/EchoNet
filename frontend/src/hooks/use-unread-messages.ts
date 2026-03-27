"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/components/socket-provider";
import { useAuth } from "./use-auth";
import { apiClient } from "@/services/api-client";

export interface PerUserUnread {
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string | null;
}

export function useUnreadMessages() {
  const { socket } = useSocket();
  const { user: currentUser } = useAuth();

  // total unread across all conversations
  const [totalUnread, setTotalUnread] = useState(0);
  // per-user: { [senderId]: { unreadCount, lastMessage, lastMessageTime } }
  const [perUser, setPerUser] = useState<Record<string, PerUserUnread>>({});

  // Fetch initial unread state from backend on mount
  useEffect(() => {
    if (!currentUser) return;
    const fetchUnread = async () => {
      try {
        // Get all users and their chat histories to find unread
        const usersRes = await apiClient.get("/users");
        const users: any[] = usersRes.data?.data?.data ?? [];
        const others = users.filter((u: any) => u.id !== currentUser.id);

        let total = 0;
        const map: Record<string, PerUserUnread> = {};

        await Promise.all(
          others.map(async (u: any) => {
            try {
              const msgRes = await apiClient.get(`/messages/${u.id}`);
              const msgs: any[] = Array.isArray(msgRes.data) ? msgRes.data : msgRes.data?.data ?? [];
              const unread = msgs.filter((m: any) => m.senderId === u.id && !m.isRead).length;
              const last = msgs[msgs.length - 1];
              if (last || unread > 0) {
                map[u.id] = {
                  unreadCount: unread,
                  lastMessage: last?.content ?? "",
                  lastMessageTime: last?.createdAt ?? null,
                };
                total += unread;
              }
            } catch {
              // ignore per-user errors
            }
          })
        );

        setTotalUnread(total);
        setPerUser(map);
      } catch {
        // ignore
      }
    };
    fetchUnread();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // Listen for real-time new messages via socket
  useEffect(() => {
    if (!socket || !currentUser) return;

    const onNewMessage = (msg: any) => {
      // Only count messages sent TO current user (not from them)
      if (msg.receiverId !== currentUser.id) return;

      const senderId = msg.senderId;
      setPerUser((prev) => {
        const existing = prev[senderId] ?? { unreadCount: 0, lastMessage: "", lastMessageTime: null };
        return {
          ...prev,
          [senderId]: {
            unreadCount: existing.unreadCount + 1,
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
          },
        };
      });
      setTotalUnread((t) => t + 1);
    };

    socket.on("new-message", onNewMessage);
    return () => { socket.off("new-message", onNewMessage); };
  }, [socket, currentUser]);

  // Call this when user opens a chat with a specific person
  const markUserRead = useCallback((userId: string) => {
    setPerUser((prev) => {
      const count = prev[userId]?.unreadCount ?? 0;
      if (count === 0) return prev;
      setTotalUnread((t) => Math.max(0, t - count));
      return {
        ...prev,
        [userId]: { ...prev[userId], unreadCount: 0 },
      };
    });

    // Tell backend
    apiClient.patch(`/messages/${userId}/read`, {}).catch(() => {});
  }, []);

  // Clear all
  const markAllRead = useCallback(() => {
    setTotalUnread(0);
    setPerUser((prev) => {
      const next: Record<string, PerUserUnread> = {};
      for (const k of Object.keys(prev)) {
        next[k] = { ...prev[k], unreadCount: 0 };
      }
      return next;
    });
  }, []);

  return { totalUnread, perUser, markUserRead, markAllRead };
}
