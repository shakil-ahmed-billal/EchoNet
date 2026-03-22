"use client"

import { useEffect } from "react"
import { useSocket } from "./socket-provider"
import { toast } from "sonner"

export const SocketHandler = () => {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("new-notification", (data: any) => {
      toast.info(data.message || "New notification received!")
    })

    socket.on("new-message", (data: any) => {
      toast.info(`New message from ${data.senderName}: ${data.content.substring(0, 30)}...`)
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
