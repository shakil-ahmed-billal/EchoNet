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
        icon: "/logo.png", // Assuming logo exists at public/logo.png
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

    socket.on("new-message", (data: any) => {
      const body = `${data.senderName}: ${data.content}`;
      toast.info(`New message from ${data.senderName}: ${data.content.substring(0, 30)}...`)
      showBrowserNotification("New Message", { body });
    })

    socket.on("incoming-call", (data: any) => {
        toast.info(`Incoming call from ${data.fromName || data.from}`, {
            duration: 10000,
            action: {
                label: "Answer",
                onClick: () => {
                    // Answer logic
                    window.dispatchEvent(new CustomEvent("answer-call", { detail: data }));
                }
            }
        })
    })

    return () => {
      socket.off("new-notification")
      socket.off("new-message")
      socket.off("incoming-call")
    }
  }, [socket])

  return null
}
