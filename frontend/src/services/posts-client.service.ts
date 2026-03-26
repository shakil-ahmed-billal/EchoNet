// Client-side post mutations — NO "use server" directive
// Uses apiClient (Axios) which correctly calls the backend at localhost:8000

import { apiClient } from "@/services/api-client";

export async function toggleReaction(postId: string, type: string): Promise<any> {
  const response = await apiClient.post("/reactions", { postId, type });
  return response.data;
}

export async function toggleSave(postId: string, isSaved: boolean): Promise<any> {
  if (isSaved) {
    const response = await apiClient.delete(`/saved-posts/${postId}`);
    return response.data;
  } else {
    const response = await apiClient.post(`/saved-posts/${postId}`, {});
    return response.data;
  }
}

export async function deletePost(id: string): Promise<void> {
  await apiClient.delete(`/posts/${id}`);
}

export async function updatePost({
  id,
  content,
  mediaUrls,
}: {
  id: string;
  content: string;
  mediaUrls?: string[];
}): Promise<any> {
  const response = await apiClient.patch(`/posts/${id}`, { content, mediaUrls });
  return response.data;
}
