"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { TrendingUp, Users, ChevronRight, Zap, MoreHorizontal, Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserImage } from "@/components/user-image"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUsers } from "@/services/users.service"
import { getFeed } from "@/services/posts.service"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/services/api-client"
import { toast } from "sonner"
import { useMemo, useState } from "react"

export function RightSidebar() {
  const pathname = usePathname()
  const isMessagesPage = pathname === "/messages"

  if (isMessagesPage) return null

  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "suggestions", "sidebar"],
    queryFn: () => getUsers({ limit: 15 }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: globalFeed, isLoading: isLoadingTrending } = useQuery({
    queryKey: ["posts", "discover", "trending"],
    queryFn: () => getFeed(undefined, true),
    staleTime: 5 * 60 * 1000,
  })

  const trendingTopics = useMemo(() => {
    if (!globalFeed?.posts) return []
    const hashtagCounts: Record<string, number> = {}
    
    globalFeed.posts.forEach((post: any) => {
      const hashtags = post.content.match(/#[\w]+/g) || []
      hashtags.forEach((tag: string) => {
        const cleanTag = tag.substring(1) // remove #
        hashtagCounts[cleanTag] = (hashtagCounts[cleanTag] || 0) + 1
      })
    })

    const sorted = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      
    if (sorted.length === 0) {
      return [
        { name: "EchoNetLaunch", posts: "New", desc: "Technology" },
        { name: "GlobalFeed", posts: "Trending", desc: "Community" },
      ]
    }

    return sorted.map(([name, count]) => ({
      name,
      posts: `${count} post${count > 1 ? 's' : ''}`,
      desc: "Trending"
    }))
  }, [globalFeed])

  const suggestedUsers = useMemo(() => {
    if (!usersData || !currentUser) return []
    return usersData
      .filter((u: any) => u.id !== currentUser.id && !u.isFriend && !u.isFollowing)
      .slice(0, 3)
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        username: `@${u.name.toLowerCase().replace(/\s+/g, '')}`,
        avatar: u.avatarUrl || u.image || ""
      }))
  }, [usersData, currentUser])

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
       return apiClient.post('/follow/follow', { followingId: userId });
    },
    onMutate: (userId) => {
       setFollowingIds(prev => new Set(prev).add(userId));
    },
    onSuccess: (_, userId) => {
       toast.success("Friend request sent!");
       queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (_, userId) => {
       setFollowingIds(prev => {
         const next = new Set(prev);
         next.delete(userId);
         return next;
       });
       toast.error("Failed to send request");
    }
  });

  return (
    <aside className="sticky top-16 flex flex-col bg-transparent h-[calc(100vh-64px)] overflow-y-auto pr-1 no-scrollbar pt-8">
      {/* Trending Section - Clean & Professional */}
      <div className="mb-6 bg-card/40 border border-border/40 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-5 pb-2">
          <h3 className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest">Trending For You</h3>
          <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-full">
            <Zap className="h-4 w-4 text-primary fill-primary/10" />
          </Button>
        </div>
        
        <div className="flex flex-col">
          {isLoadingTrending ? (
            <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            trendingTopics.map((topic, i) => (
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
                <p className="text-[11px] text-muted-foreground/60 font-medium">{topic.posts}</p>
              </button>
            ))
          )}
          <button className="w-full p-4 text-left text-xs font-bold text-primary/70 hover:bg-card/80 transition-all rounded-b-3xl">
            Show more
          </button>
        </div>
      </div>

      {/* Who to Follow - Premium Clean Look */}
      <div className="bg-card/40 border border-border/40 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 pb-2">
          <h3 className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest">Who To Follow</h3>
        </div>

        <div className="flex flex-col p-2 gap-1">
          {isLoadingUsers ? (
            <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : suggestedUsers.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No new suggestions</div>
          ) : (
            suggestedUsers.map((item) => (
               <div 
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-card/60 transition-all group"
              >
                <Link href={`/profile/${item.id}`} className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity">
                  <UserImage user={{ name: item.name, avatarUrl: item.avatar }} className="h-9 w-9 border border-border/10" />
                  <div className="flex flex-col min-w-0 pr-2">
                    <p className="font-bold text-sm text-foreground/90 truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider truncate">{item.username}</p>
                  </div>
                </Link>
                <Button 
                  size="sm" 
                  className="h-8 px-4 rounded-xl text-[10px] font-bold shadow-sm active:scale-95 transition-transform bg-foreground text-background hover:bg-foreground/90 shrink-0"
                  onClick={() => followMutation.mutate(item.id)}
                  disabled={followingIds.has(item.id)}
                >
                  {followingIds.has(item.id) ? (
                    <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Sent</>
                  ) : (
                    <><UserPlus className="h-3 w-3 mr-1" /> Add</>
                  )}
                </Button>
              </div>
            ))
          )}
          <Link href="/friends" className="w-full block p-3.5 pl-5 text-left text-xs font-bold text-primary/70 hover:bg-card/80 transition-all rounded-b-3xl">
            Show all friends
          </Link>
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
