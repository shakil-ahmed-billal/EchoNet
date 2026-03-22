import { apiClient } from "./api-client"

export type Post = {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatarUrl?: string
  }
  likesCount: number
  commentsCount: number
  createdAt: string
  mediaUrls: string[]
}

export const PostsService = {
  async getFeed(): Promise<Post[]> {
    const response = await apiClient.get("/posts")
    return response.data.data
  },
  
  async createPost(content: string): Promise<Post> {
    const response = await apiClient.post("/posts", { content, authorId: "94c87b73-ae4a-41ad-8355-46e618044d3e" }) // using seeded sarah jenkins id for test
    return response.data.data
  }
}
