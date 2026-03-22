"use client"

import { usePathname } from "next/navigation"
import { TrendingUp, Users, ChevronRight, Zap, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function RightSidebar() {
  const pathname = usePathname()
  const isMessagesPage = pathname === "/messages"

  if (isMessagesPage) return null

  const trendingTopics = [
    { name: "EchoNetLaunch", posts: "2.4k", desc: "Technology" },
    { name: "Web3Culture", posts: "1.8k", desc: "Business" },
    { name: "ModernDesign", posts: "942", desc: "Aesthetics" },
    { name: "AIRevolution", posts: "756", desc: "Science" },
  ]

  const suggestedUsers = [
    { name: "Sarah Connor", username: "@sconnor", avatar: "" },
    { name: "Rick Deckard", username: "@deckard", avatar: "" },
    { name: "Major Motoko", username: "@motoko", avatar: "" },
  ]

  return (
    <aside className="sticky top-20 flex flex-col bg-background h-[calc(100vh-100px)] overflow-y-auto pr-1">
      {/* Trending Section - Clean & Professional */}
      <div className="mb-6 bg-card/40 border border-border/40 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-5 pb-2">
          <h3 className="text-sm font-bold tracking-tight text-foreground/90">Trending for you</h3>
          <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-full">
            <Zap className="h-4 w-4 text-primary fill-primary/10" />
          </Button>
        </div>
        
        <div className="flex flex-col">
          {trendingTopics.map((topic, i) => (
            <button 
              key={topic.name} 
              className={cn(
                "w-full flex flex-col gap-0.5 px-5 py-3.5 text-left hover:bg-card/80 transition-all group border-border/20",
                i !== trendingTopics.length - 1 && "border-b"
              )}
            >
              <div className="flex justify-between items-center w-full">
                 <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">{topic.desc}</p>
                 <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-bold text-[14px] text-foreground transition-colors group-hover:text-primary tracking-tight">#{topic.name}</p>
              <p className="text-[11px] text-muted-foreground/60 font-medium">{topic.posts} posts</p>
            </button>
          ))}
          <button className="w-full p-4 text-left text-xs font-bold text-primary hover:bg-card/80 transition-all">
            Show more
          </button>
        </div>
      </div>

      {/* Who to Follow - Premium Clean Look */}
      <div className="bg-card/40 border border-border/40 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 pb-2">
          <h3 className="text-sm font-bold tracking-tight text-foreground/90">Who to follow</h3>
        </div>

        <div className="flex flex-col p-2 gap-1">
          {suggestedUsers.map((item) => (
            <div 
              key={item.username}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-card/60 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 border border-border/10">
                   <AvatarImage src={item.avatar} alt={item.name} />
                   <AvatarFallback className="text-[10px] font-bold bg-muted/50">{item.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="font-bold text-xs text-foreground truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium truncate">{item.username}</p>
                </div>
              </div>
              <Button size="sm" className="h-8 px-4 rounded-xl text-[10px] font-bold shadow-md shadow-primary/10 active:scale-95 transition-transform bg-foreground text-background hover:bg-foreground/90">
                Follow
              </Button>
            </div>
          ))}
          <button className="w-full p-3 pl-4 text-left text-xs font-bold text-primary hover:bg-card/80 transition-all">
            Show more
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 px-4 pb-8">
         <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-tight">
            <a href="#" className="hover:text-primary/60 transition-colors">About</a>
            <a href="#" className="hover:text-primary/60 transition-colors">Help</a>
            <a href="#" className="hover:text-primary/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-primary/60 transition-colors">Ads info</a>
            <span>&copy; 2026 EchoNet Inc.</span>
         </div>
      </div>
    </aside>
  )
}
