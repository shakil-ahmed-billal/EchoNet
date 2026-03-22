import { Metadata } from "next"
import { Send, Phone, Video, MoreVertical, Search, Edit } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export const metadata: Metadata = {
  title: "Messages | EchoNet",
  description: "Chat with your EchoNet friends",
}

const mockThreads = [
  { id: 1, name: "Alice Johnson", avatar: "AJ", lastMessage: "See you tomorrow!", time: "10:42 AM", unread: 0 },
  { id: 2, name: "Robert Smith", avatar: "RS", lastMessage: "Can you send me that file?", time: "Yesterday", unread: 2 },
  { id: 3, name: "Maria Garcia", avatar: "MG", lastMessage: "Haha that's hilarious 😂", time: "Tuesday", unread: 0 },
  { id: 4, name: "Design Team", avatar: "DT", lastMessage: "New Figma links are up.", time: "Monday", unread: 5 },
]

export default function MessagesPage() {
  return (
    <div className="flex bg-card rounded-2xl border shadow-sm h-[calc(100vh-8rem)] overflow-hidden">
      {/* Threads Sidebar */}
      <div className="w-full md:w-80 flex flex-col border-r h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-xl">Messages</h2>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages..."
              className="pl-8 bg-muted border-none shadow-none rounded-full h-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-2 space-y-1">
            {mockThreads.map((thread) => (
              <button
                key={thread.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-left transition-colors truncate"
              >
                <Avatar className="h-12 w-12 border">
                  <AvatarFallback>{thread.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold truncate pr-2">{thread.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{thread.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground truncate pr-2">
                      {thread.lastMessage}
                    </span>
                    {thread.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shrink-0">
                        {thread.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Active Chat Area */}
      <div className="hidden md:flex flex-col flex-1 h-full bg-muted/10">
        {/* Chat Header */}
        <div className="p-3 border-b flex items-center justify-between bg-card shrink-0 h-[73px]">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold leading-none mb-1">Alice Johnson</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages List Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Today</span>
            </div>
            
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground rounded-2xl p-3 max-w-[75%] rounded-br-sm shadow-sm">
                Hey Alice, are we still on for the meeting?
                <p className="text-[10px] text-primary-foreground/70 text-right mt-1">10:30 AM</p>
              </div>
            </div>
            
            <div className="flex justify-start items-end gap-2">
              <Avatar className="h-6 w-6 shrink-0 border">
                <AvatarFallback className="text-[10px]">AJ</AvatarFallback>
              </Avatar>
              <div className="bg-card border rounded-2xl p-3 max-w-[75%] rounded-bl-sm shadow-sm">
                Yes absolutely! I'll be there in 10 mins.
                <p className="text-[10px] text-muted-foreground text-right mt-1">10:32 AM</p>
              </div>
            </div>
            
            <div className="flex justify-start items-end gap-2">
              <Avatar className="h-6 w-6 shrink-0 opacity-0">
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
              <div className="bg-card border rounded-2xl p-3 max-w-[75%] rounded-bl-sm shadow-sm">
                See you tomorrow!
                <p className="text-[10px] text-muted-foreground text-right mt-1">10:42 AM</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Chat Input Area */}
        <div className="p-4 bg-card border-t shrink-0">
          <div className="flex items-end gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-muted border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button size="icon" className="rounded-full shrink-0">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
