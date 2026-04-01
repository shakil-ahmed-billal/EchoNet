import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { NotificationsList } from "@/components/notifications/notifications-list"

export const metadata: Metadata = {
  title: "Notifications | EchoNet",
  description: "Your EchoNet notifications",
}

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-4xl mx-auto w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header Card */}
      <div className="bg-card/60 backdrop-blur-sm md:rounded-2xl border border-border/20 shadow-sm p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground font-medium">Stay updated with your latest activity</p>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl px-4 h-10 border-border/40 hover:bg-muted/50 text-xs font-bold">
             Mark all as read
          </Button>
        </div>
        
        <div className="sm:hidden w-full">
          <Button variant="outline" size="sm" className="w-full rounded-xl h-11 border-border/40 hover:bg-muted/50 text-xs font-bold">
             Mark all as read
          </Button>
        </div>
      </div>
      
      <NotificationsList />
    </div>
  )
}

