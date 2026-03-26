"use client"

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFeed, createPost, Post, PaginatedPosts } from "@/services/posts.service"
import { toast } from "sonner"

export function usePosts(discover: boolean = false, authorId?: string) {
  return useInfiniteQuery({
    queryKey: ["posts", discover ? "discover" : "feed", authorId],
    queryFn: ({ pageParam }) => getFeed(pageParam, discover, authorId),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    retry: false,
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
