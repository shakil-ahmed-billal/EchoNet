"use client";

import React, { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/hooks/use-auth"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type SocketContextType = {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user) {
        if (socket) socket.disconnect();
        return;
    }

    const userId = user.id;

    const socketInstance = io("", {
      query: { userId },
      withCredentials: true,
      transports: ["polling", "websocket"],
    })

    socketInstance.on("connect", () => {
      setIsConnected(true)
      console.log("Socket connected naturally after login.")
    })

    socketInstance.on("disconnect", () => {
      setIsConnected(false)
      console.log("Socket disconnected naturally.")
    })

    socketInstance.on("notification", (notif) => {
      // Invalidate both the list and the unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      
      // Also invalidate friend requests if it's a follow request
      if (notif.type === 'FOLLOW_REQUEST' || notif.type === 'FRIEND_REQUEST') {
        queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      }

      toast(notif.message, {
        description: "New Activity Detected",
        action: {
          label: "View",
          onClick: () => (window.location.href = "/notifications"),
        },
      });
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user, isAuthenticated, queryClient])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
