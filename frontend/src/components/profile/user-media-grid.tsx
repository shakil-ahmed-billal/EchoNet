"use client"

import { useUserMedia } from "@/hooks/use-profile-tabs"
import { Loader2, Image as ImageIcon, Camera } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function UserMediaGrid({ userId }: { userId: string }) {
  const { data: mediaPosts, isLoading } = useUserMedia(userId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary/50" />
      </div>
    )
  }

  const posts = (mediaPosts as any)?.posts ?? []
  
  // Extract all individual media items from posts
  const mediaItems = posts.flatMap((post: any) => 
    (post.mediaUrls || []).filter(Boolean).map((url: string) => ({
      postId: post.id,
      url,
      content: post.content
    }))
  )

  if (mediaItems.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-muted rounded-[32px] bg-muted/5">
        <Camera className="size-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm font-medium text-muted-foreground">No media shared yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {mediaItems.map((item: any, index: number) => (
        <Link 
          key={`${item.postId}-${index}`} 
          href={`/post/${item.postId}`}
          className="group relative aspect-square rounded-[24px] overflow-hidden border border-border/10 bg-muted/20"
        >
          <Image 
            src={item.url} 
            alt={`Media from post ${item.postId}`} 
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <ImageIcon className="size-6 text-white" />
          </div>
        </Link>
      ))}
    </div>
  )
}
