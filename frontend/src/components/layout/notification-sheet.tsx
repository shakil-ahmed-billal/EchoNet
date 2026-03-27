"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Bell, Check, Loader2, UserPlus, Heart, MessageSquare, Info, Zap } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { type Notification as ApiNotification } from "@/services/notifications.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect } from "react"

import { useMarkNotificationAsRead, useNotifications, useUnreadNotificationsCount } from "@/hooks/use-notifications"

export function NotificationSheet() {
  const queryClient = useQueryClient()
  const { data: notifications = [], isLoading } = useNotifications()
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()

  const markReadMutation = useMarkNotificationAsRead()

  // Browser Notifications
  useEffect(() => {
    if (unreadCount > 0 && Notification.permission === "granted") {
      const latest = notifications?.[0]
      if (latest && !latest.isRead) {
        new Notification("EchoNet", {
          body: latest.message,
          icon: "/favicon.ico",
        })
      }
    }
  }, [unreadCount, notifications])

  const requestPermission = () => {
    if (Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "FRIEND_REQUEST": 
      case "FOLLOW_REQUEST":
        return <UserPlus className="h-4 w-4 text-primary" />
      case "FRIEND_ACCEPT": 
      case "FOLLOW":
        return <Check className="h-4 w-4 text-green-500" />
      case "LIKE": 
      case "REACTION":
        return <Heart className="h-4 w-4 text-red-500 fill-red-500" />
      case "COMMENT": return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "MESSAGE": return <Zap className="h-4 w-4 text-yellow-500" />
      default: return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-10 rounded-full relative hover:bg-muted/80 hover:text-foreground transition-all group"
          onClick={requestPermission}
        >
          <Bell className="size-5 transition-transform group-hover:scale-110" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 gap-0 flex flex-col bg-card border-l border-border/40 shadow-2xl">
        <SheetHeader className="p-6 border-b border-border/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold tracking-tight">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <div className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest border border-primary/20">
                {unreadCount} Unread
              </div>
            )}
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              </div>
            ) : notifications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center opacity-40">
                <Bell className="h-12 w-12 mb-4" />
                <p className="text-sm font-bold text-muted-foreground/30">No notifications yet</p>
                <p className="text-xs mt-1">We'll alert you when something happens.</p>
              </div>
            ) : (
              notifications?.map((item: ApiNotification) => (
                <div 
                  key={item.id}
                  className={cn(
                    "flex gap-4 p-5 hover:bg-muted/30 transition-all cursor-pointer border-b border-border/5 group relative",
                    !item.isRead && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                  onClick={() => !item.isRead && markReadMutation.mutate(item.id)}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-border/10 shadow-sm">
                       <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                         {item.type.substring(0, 2)}
                       </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-card rounded-full flex items-center justify-center shadow-sm border border-border/10">
                      {getIcon(item.type)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <p className={cn(
                      "text-sm leading-relaxed",
                      !item.isRead ? "text-foreground font-semibold" : "text-muted-foreground"
                    )}>
                      {item.message}
                    </p>
                    <span className="text-[10px] font-bold text-muted-foreground/30 mt-0.5">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {!item.isRead && (
                    <div className="absolute top-6 right-5 size-2 bg-primary rounded-full shadow-sm animate-pulse" />
                  )}
                </div>
              ))
             )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-border/10 bg-muted/10">
          <Button variant="ghost" className="w-full text-xs font-bold h-10 hover:bg-muted opacity-60 hover:opacity-100 transition-all rounded-xl">
            Clear all notifications
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
