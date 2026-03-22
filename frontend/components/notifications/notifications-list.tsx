"use client"

import { Heart, MessageCircle, UserPlus, ShieldAlert, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useNotifications, useMarkNotificationAsRead } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

const iconMap = {
  LIKE: { icon: Heart, color: "text-rose-500", bgColor: "bg-rose-500/10" },
  COMMENT: { icon: MessageCircle, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  MESSAGE: { icon: MessageCircle, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  FOLLOW: { icon: UserPlus, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  ANNOUNCEMENT: { icon: ShieldAlert, color: "text-amber-500", bgColor: "bg-amber-500/10" },
}

export function NotificationsList() {
  const { data: notifications, isLoading, isError } = useNotifications()
  const { mutate: markAsRead } = useMarkNotificationAsRead()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Syncing Intel...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-12 text-center text-muted-foreground border border-dashed border-edge rounded-2xl bg-muted/5">
        <div className="size-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
           <ShieldAlert className="size-8 text-destructive/20" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest">Connection Failure</p>
        <p className="text-xs mt-1">Unable to retrieve system notifications.</p>
      </div>
    )
  }

  if (!notifications?.length) {
    return (
      <div className="p-12 text-center text-muted-foreground border border-dashed border-edge rounded-2xl bg-muted/5">
        <div className="size-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
           <MessageCircle className="size-8 text-muted-foreground/20" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest">Zero Intel</p>
        <p className="text-xs mt-1 text-muted-foreground/60 leading-relaxed">Your neural-link is clear.<br/>No pending notifications detected at this time.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {notifications.map((notif) => {
        const config = iconMap[notif.type as keyof typeof iconMap] || iconMap.ANNOUNCEMENT
        const Icon = config.icon
        
        return (
          <div 
            key={notif.id} 
            className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 group cursor-pointer hover:translate-x-1 ${
              notif.isRead 
                ? "bg-card border-edge text-card-foreground hover:border-primary/20" 
                : "bg-primary/5 border-primary/20 shadow-sm shadow-primary/5"
            }`}
            onClick={() => !notif.isRead && markAsRead(notif.id)}
          >
            <div className="relative shrink-0">
              <Avatar className="h-12 w-12 border border-edge ring-offset-background group-hover:scale-105 transition-transform">
                <AvatarFallback className="bg-muted font-bold text-xs">UN</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background shadow-lg flex items-center justify-center ${config.bgColor}`}>
                <Icon className={`h-3 w-3 ${config.color}`} />
              </div>
            </div>
            
            <div className="flex flex-col flex-1 gap-1.5 min-w-0">
              <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                {notif.message}
              </p>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest leading-none">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                 </span>
                 {!notif.isRead && (
                   <>
                     <span className="size-1 rounded-full bg-primary/30" />
                     <span className="text-[9px] text-primary font-semibold uppercase tracking-widest leading-none">Undeclared</span>
                   </>
                 )}
              </div>
            </div>
            
            {!notif.isRead && (
              <div className="h-2.5 w-2.5 bg-primary rounded-full mt-1.5 shrink-0 shadow-lg shadow-primary/20" />
            )}
          </div>
        )
      })}
    </div>
  )
}
