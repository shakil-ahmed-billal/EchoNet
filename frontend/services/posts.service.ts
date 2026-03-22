"use server";

import { httpClient } from "@/lib/axios/httpClient"
import { cookies } from "next/headers";

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

export async function createPost(data: FormData | { content: string; mediaUrls?: string[] }): Promise<Post> {
  console.log("SERVER ACTION: createPost called");
  
  // Use native fetch for FormData to avoid axios node-side issues
  if (data instanceof FormData) {
      console.log("Data is FormData - Using Fetch");
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1") + "/posts";
      
      try {
          const response = await fetch(API_URL, {
              method: 'POST',
              body: data,
              headers: {
                  'Cookie': cookieHeader,
                  // Do NOT set Content-Type, fetch will set it with boundary
              }
          });
          
          const contentType = response.headers.get("content-type");
          let result;
          if (contentType && contentType.includes("application/json")) {
              result = await response.json();
          } else {
              const text = await response.text();
              console.error("Non-JSON Error Response:", text);
              throw new Error(`Server Error: ${response.status} ${response.statusText}`);
          }

          if (!response.ok) {
              console.error("Fetch Error:", result);
              throw new Error(result.message || "Failed to create post");
          }
          console.log("SERVER ACTION: createPost SUCCESS", result.data.id);
          return result.data;
      } catch (error: any) {
          console.error("SERVER ACTION: createPost FAILURE", error.message);
          throw error;
      }
  }

  // Fallback to axios for plain objects (if any)
  try {
    const response = await httpClient.post<{ data: Post }>("/posts", data)
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Failed to create post");
  }
}

export async function updatePost({ id, content, mediaUrls }: { id: string; content: string; mediaUrls?: string[] }): Promise<Post> {
  const response = await httpClient.patch<{ data: Post }>(`/posts/${id}`, { content, mediaUrls })
  return response.data;
}

export async function deletePost(id: string): Promise<void> {
  await httpClient.delete(`/posts/${id}`)
}
