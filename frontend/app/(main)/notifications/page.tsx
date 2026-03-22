import { Metadata } from "next"
import { Bell, Heart, MessageCircle, UserPlus, ShieldAlert } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Notifications | EchoNet",
  description: "Your EchoNet notifications",
}

const mockNotifications = [
  { id: 1, type: "like", user: "Alice Johnson", action: "liked your post", time: "2m ago", read: false, icon: Heart, iconColor: "text-rose-500", bgColor: "bg-rose-500/10" },
  { id: 2, type: "comment", user: "Robert Smith", action: "commented: 'This is amazing!'", time: "1h ago", read: false, icon: MessageCircle, iconColor: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: 3, type: "follow", user: "Design Team", action: "started following you", time: "3h ago", read: true, icon: UserPlus, iconColor: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { id: 4, type: "system", user: "System", action: "Your account was successfully verified.", time: "1d ago", read: true, icon: ShieldAlert, iconColor: "text-amber-500", bgColor: "bg-amber-500/10" },
]

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <Button variant="outline" size="sm">Mark all as read</Button>
      </div>
      
      <div className="flex flex-col gap-3">
        {mockNotifications.map((notif) => {
          const Icon = notif.icon
          return (
            <div 
              key={notif.id} 
              className={`flex items-start gap-4 p-4 rounded-xl border shadow-sm transition-colors ${
                notif.read ? "bg-card text-card-foreground" : "bg-muted/30 border-primary/20"
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 border">
                  <AvatarFallback>{notif.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background flex items-center justify-center ${notif.bgColor}`}>
                  <Icon className={`h-3 w-3 ${notif.iconColor}`} />
                </div>
              </div>
              
              <div className="flex flex-col flex-1 gap-1">
                <p className="text-sm">
                  <span className="font-semibold">{notif.user}</span> {notif.action}
                </p>
                <p className="text-xs text-muted-foreground">{notif.time}</p>
              </div>
              
              {!notif.read && (
                <div className="h-2 w-2 bg-primary rounded-full mt-2 shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

