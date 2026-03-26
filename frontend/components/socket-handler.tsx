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
        const ringtone = new Audio("/sounds/incoming.mp3");
        ringtone.loop = true;
        ringtone.play().catch(e => console.warn("Audio play failed:", e));

        toast.info(`Incoming call from ${data.fromName || data.from}`, {
            id: `call-${data.from}`,
            duration: 30000,
            action: {
                label: "Answer",
                onClick: () => {
                    ringtone.pause();
                    // Answer logic
                    window.dispatchEvent(new CustomEvent("answer-call", { detail: data }));
                }
            },
            onAutoClose: () => ringtone.pause(),
            onDismiss: () => ringtone.pause(),
        })
    })

    socket.on("end-call", () => {
        toast.dismiss(); // Dismiss all or specific call toast
    })

    return () => {
      socket.off("new-notification")
      socket.off("new-message")
      socket.off("incoming-call")
    }
  }, [socket])

  return null
}
