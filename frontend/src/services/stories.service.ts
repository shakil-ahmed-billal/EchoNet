import { apiClient } from "./api-client";

export interface StoryItem {
  id: string;
  mediaUrl: string;
  caption?: string;
  expiresAt: string;
  createdAt: string;
  isSeen: boolean;
  viewsCount: number;
}

export interface StoryGroup {
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    image?: string;
  };
  stories: StoryItem[];
  hasUnseen: boolean;
}

export const getStories = async (): Promise<StoryGroup[]> => {
  const res = await apiClient.get("/stories");
  return res.data.data;
};

export const createStory = async (formData: FormData): Promise<StoryItem> => {
  const res = await apiClient.post("/stories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const viewStory = async (storyId: string): Promise<void> => {
  await apiClient.post(`/stories/${storyId}/view`);
};

export const deleteStory = async (storyId: string): Promise<void> => {
  await apiClient.delete(`/stories/${storyId}`);
};
