"use server";

import { httpClient } from "@/lib/axios/httpClient"

export type Post = {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatarUrl?: string
  }
  isLiked?: boolean
  _count: {
    likes: number
    comments: number
  }
  createdAt: string
  mediaUrls: string[]
}

export type PaginatedPosts = {
  posts: Post[]
  nextCursor: string | null
}

export async function getFeed(cursor?: string, discover: boolean = false, authorId?: string): Promise<PaginatedPosts> {
  try {
    console.log("Calling getFeed with cursor:", cursor, "discover:", discover, "authorId:", authorId);
    const response = await httpClient.get<any>("/posts", {
      params: { cursor, limit: 10, discover, authorId }
    })
    return response.data
  } catch (error: any) {
    console.error("getFeed ERROR:", error?.response?.data || error.message);
    // Return a safe fallback rather than throwing a 500 to the client, preventing complete UI crash
    return { posts: [], nextCursor: null } as PaginatedPosts;
  }
}

export async function createPost({ content, mediaUrls }: { content: string; mediaUrls?: string[] }): Promise<Post> {
  const response = await httpClient.post<{ data: Post }>("/posts", { content, mediaUrls })
  return response.data;
}

export async function updatePost({ id, content, mediaUrls }: { id: string; content: string; mediaUrls?: string[] }): Promise<Post> {
  const response = await httpClient.patch<{ data: Post }>(`/posts/${id}`, { content, mediaUrls })
  return response.data;
}

export async function deletePost(id: string): Promise<void> {
  await httpClient.delete(`/posts/${id}`)
}
