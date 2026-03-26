"use client";

import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getFeed, type Post, type PaginatedPosts } from "@/services/posts.service";
import { PostCard } from "@/components/feed/post-card";
import { CreatePost } from "@/components/feed/create-post";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function FeedPage() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery<PaginatedPosts, Error, InfiniteData<PaginatedPosts>, string[], string | undefined>({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => getFeed(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest animate-pulse">
          Loading Feed...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-0">
      <CreatePost />

      <div className="flex flex-col gap-1 ">
        {data?.pages.map((page: PaginatedPosts) =>
          page.posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {hasNextPage && (
        <div ref={ref} className="flex justify-center p-8">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
             <span className="text-xs font-bold text-muted-foreground uppercase opacity-50">
                Load More
             </span>
          )}
        </div>
      )}

      {!hasNextPage && data && data.pages.length > 0 && data.pages[0].posts.length > 0 && (
        <div className="text-center p-12 text-muted-foreground">
          <p className="text-sm font-medium">You&apos;re all caught up!</p>
          <p className="text-xs mt-1">No more posts to show right now.</p>
        </div>
      )}
      
      {data && data.pages.length > 0 && data.pages[0].posts.length === 0 && (
         <div className="text-center p-20 border border-dashed border-edge rounded-2xl bg-muted/5">
            <p className="text-lg font-semibold text-foreground">Your feed is empty</p>
            <p className="text-sm text-muted-foreground mt-2">Start following people to see their posts here!</p>
         </div>
      )}
    </div>
  );
}
