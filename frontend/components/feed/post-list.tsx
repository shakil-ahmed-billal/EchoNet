"use client"

import { usePosts } from "@/hooks/use-posts"
import { PostCard } from "./post-card"
import { Skeleton } from "@/components/ui/skeleton"

export function PostList() {
  const { data: posts, isLoading, isError } = usePosts()

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
        Failed to load posts. Please try again later.
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
        No posts yet. Be the first to post!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
