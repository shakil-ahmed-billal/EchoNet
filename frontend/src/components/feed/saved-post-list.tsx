"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { useSavedPosts } from "@/hooks/use-posts"
import { PostCard } from "./post-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Bookmark } from "lucide-react"

export function SavedPostList() {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    isError 
  } = useSavedPosts()

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col space-y-3 bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-muted-foreground border rounded-xl bg-card">
        Failed to load saved posts. Please try again later.
      </div>
    )
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  if (posts.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-muted rounded-3xl bg-muted/5 gap-4">
        <Bookmark className="size-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">You haven't saved any posts yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {hasNextPage && (
        <div ref={ref} className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center p-8 text-muted-foreground text-sm">
          You've reached the end of your saved posts.
        </div>
      )}
    </div>
  )
}
