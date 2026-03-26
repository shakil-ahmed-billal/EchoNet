import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { NotificationsList } from "@/components/notifications/notifications-list"

export const metadata: Metadata = {
  title: "Notifications | EchoNet",
  description: "Your EchoNet notifications",
}

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-center justify-between border-b border-edge pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay updated with your EchoNet activity</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl px-6 h-10 border-edge hover:bg-muted/50">
           Mark all as read
        </Button>
      </div>
      
      <NotificationsList />
    </div>
  )
}

