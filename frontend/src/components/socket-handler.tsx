"use client"

import { useEffect } from "react"
import { useSocket } from "./socket-provider"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export const SocketHandler = () => {
  const { socket } = useSocket()
  const queryClient = useQueryClient()

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
      // Show toast
      toast.info(data.message || "New notification received!")
      showBrowserNotification("EchoNet", { body: data.message });
      // Auto-refresh notification list and badge count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    })

    socket.on("new-message", (data: any) => {
      if (window.location.pathname !== "/messages") {
        const body = `${data.senderName}: ${data.content}`
        toast.info(`New message from ${data.senderName}: ${data.content.substring(0, 30)}...`)
        showBrowserNotification("New Message", { body });
      }
    })

    return () => {
      socket.off("new-notification")
      socket.off("new-message")
    }
  }, [socket, queryClient])

  return null
}

