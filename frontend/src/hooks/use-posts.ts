"use client"

/** Optimized post & story hooks */

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFeed, getSavedPosts, getStoriesAction, createPost, Post, PaginatedPosts } from "@/services/posts.service"
import { toast } from "sonner"

export function usePosts(discover: boolean = false, authorId?: string) {
  return useInfiniteQuery({
    queryKey: ["posts", discover ? "discover" : "feed", authorId],
    queryFn: ({ pageParam }) => getFeed(pageParam, discover, authorId),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    retry: false,
    staleTime: 60 * 1000, // 1 minute cache to deduplicate simultaneous requests
  })
}

export function useSavedPosts() {
  return useInfiniteQuery({
    queryKey: ["posts", "saved"],
    queryFn: ({ pageParam }) => getSavedPosts(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    retry: false,
    staleTime: 60 * 1000,
  })
}

export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: () => getStoriesAction(),
    staleTime: 60 * 1000, // 1 minute stale time
    refetchInterval: 120 * 1000, // Polling stories every 2 minutes
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { content: string; mediaUrls?: string[] }) => 
      createPost(payload),
    onSuccess: (newPost: Post) => {
      // Optimistically update the feed with the new post at the top of the first page
      queryClient.setQueryData<{ pages: PaginatedPosts[], pageParams: any[] }>(
        ["posts", "feed"], 
        (oldData) => {
          if (!oldData) return { 
            pages: [{ posts: [newPost], nextCursor: null }], 
            pageParams: [undefined] 
          }
          
          const newPages = [...oldData.pages]
          newPages[0] = {
            ...newPages[0],
            posts: [newPost, ...newPages[0].posts]
          }
          
          return {
            ...oldData,
            pages: newPages
          }
        }
      )
      toast.success("Post created successfully!")
    },
    onError: () => {
      toast.error("Failed to create post. Please try again.")
    }
  })
}
