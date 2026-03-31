"use client"

import { useUserReplies } from "@/hooks/use-profile-tabs"
import { Loader2, MessageSquare, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function UserRepliesList({ userId }: { userId: string }) {
  const { data: replies, isLoading } = useUserReplies(userId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary/50" />
      </div>
    )
  }

  if (!replies || replies.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-muted rounded-[32px] bg-muted/5">
        <MessageSquare className="size-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm font-medium text-muted-foreground">No replies yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {replies.map((reply: any) => (
        <div key={reply.id} className="group relative bg-card/50 backdrop-blur-sm border border-border/40 rounded-3xl p-6 hover:bg-muted/30 transition-all duration-300">
          <div className="flex items-start gap-4">
            <Avatar className="size-10 border-2 border-background shadow-sm">
                <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">
                    {reply.author.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{reply.author.name}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    • {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <Link 
                  href={`/post/${reply.post.id}`}
                  className="size-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>

              <div className="text-sm text-foreground leading-relaxed">
                {reply.content}
              </div>

              <Link href={`/post/${reply.post.id}`} className="block mt-4">
                <div className="p-3 rounded-2xl bg-muted/30 border border-border/10 text-[10px] group-hover:bg-muted/50 transition-colors">
                   <p className="text-muted-foreground font-black uppercase tracking-widest mb-1">Replying to</p>
                   <p className="line-clamp-1 font-medium text-muted-foreground italic">
                     "{reply.post.content || "Media Post"}" 
                     <span className="not-italic text-foreground font-bold ml-1">— by {reply.post.author.name}</span>
                   </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
