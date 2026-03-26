"use client"

import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface FloatingCallIndicatorProps {
  remoteUser: any
  onClick: () => void
  isVisible: boolean
}

export const FloatingCallIndicator = ({ remoteUser, onClick, isVisible }: FloatingCallIndicatorProps) => {
  if (!isVisible) return null

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        {/* Pulsating background for "active call" effect */}
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        
        <Avatar className="h-16 w-16 ring-4 ring-primary ring-offset-4 ring-offset-background shadow-2xl transition-transform group-hover:scale-110 active:scale-95">
          <AvatarImage src={remoteUser?.avatarUrl || remoteUser?.image} />
          <AvatarFallback className="bg-primary/20 text-primary font-bold">
            {remoteUser?.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Micro indicator */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl pointer-events-none">
        Call with {remoteUser?.name}
      </div>
    </div>
  )
}
