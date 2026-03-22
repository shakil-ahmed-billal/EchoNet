"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/hooks/use-auth" // Import the auth layer

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
  const { user, isAuthenticated } = useAuth(); // Hook into session

  useEffect(() => {
    // Only connect if user is actually loaded
    if (!isAuthenticated || !user) {
        if (socket) socket.disconnect();
        return;
    }

    const userId = user.id;

    const socketInstance = io("http://localhost:8000", {
      query: { userId },
      withCredentials: true,
    })

    socketInstance.on("connect", () => {
      setIsConnected(true)
      console.log("Socket connected naturally after login.")
    })

    socketInstance.on("disconnect", () => {
      setIsConnected(false)
      console.log("Socket disconnected naturally.")
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user, isAuthenticated])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
