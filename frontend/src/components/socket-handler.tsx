"use client"

import { useEffect } from "react"
import { useSocket } from "./socket-provider"
import { toast } from "sonner"

export const SocketHandler = () => {
  const { socket } = useSocket()

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = (title: string, options: NotificationOptions = {}) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        icon: "/logo.png",
        ...options
      });
    }
  };

  useEffect(() => {
    if (!socket) return

    socket.on("new-notification", (data: any) => {
      toast.info(data.message || "New notification received!")
      showBrowserNotification("EchoNet", { body: data.message });
    })

    // Messaging notifications can be handled here for global alerts
    socket.on("new-message", (data: any) => {
      // Only show if user is NOT on the messages page or doesn't have the chat open
      if (window.location.pathname !== "/messages") {
        const body = `${data.senderName}: ${data.content}`;
        toast.info(`New message from ${data.senderName}: ${data.content.substring(0, 30)}...`)
        showBrowserNotification("New Message", { body });
      }
    })

    // Call-related events are now handled centrally in CallManager.tsx
    // to avoid conflicts and ensure a consistent UI (Accept/Decline Modal).

    return () => {
      socket.off("new-notification")
      socket.off("new-message")
    }
  }, [socket])

  return null
}
