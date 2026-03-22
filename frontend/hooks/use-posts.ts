"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PostsService, Post } from "@/services/posts.service"
import { toast } from "sonner"

export function usePosts() {
  return useQuery({
    queryKey: ["posts", "feed"],
    queryFn: () => PostsService.getFeed()
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => PostsService.createPost(content),
    onSuccess: (newPost) => {
      // Optimistically update the feed with the new post at the top
      queryClient.setQueryData<Post[]>(["posts", "feed"], (oldPosts) => {
        return oldPosts ? [newPost, ...oldPosts] : [newPost]
      })
      toast.success("Post created successfully!")
    },
    onError: () => {
      toast.error("Failed to create post. Please try again.")
    }
  })
}
