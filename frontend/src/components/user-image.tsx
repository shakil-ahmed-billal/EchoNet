"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserImageProps {
  user?: {
    name?: string
    image?: string
    avatarUrl?: string
  }
  className?: string
  alt?: string
}

export function UserImage({ user, className, alt }: UserImageProps) {
  const imageUrl = user?.image || user?.avatarUrl
  const name = user?.name || "User"
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <Avatar className={cn("h-10 w-10 border border-border/50 shadow-sm overflow-hidden", className)}>
      <AvatarImage src={imageUrl} alt={alt || name} className="object-cover h-full w-full" />
      <AvatarFallback className="bg-primary/5 text-primary font-bold">
        {initials || "U"}
      </AvatarFallback>
    </Avatar>
  )
}
