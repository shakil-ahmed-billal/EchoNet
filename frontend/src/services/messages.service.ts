"use server";

import { httpClient } from "@/lib/axios/httpClient"

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: string
}

export interface ChatThread {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
}

export async function getChatHistory(otherUserId: string) {
  try {
    const response = await httpClient.get<any>(`/messages/${otherUserId}`)
    return response.data as Message[]
  } catch (error: any) {
    console.error("MessagesService failed:", error?.message);
    return [];
  }
}

export async function sendMessage(payload: { receiverId?: string; groupId?: string; content: string }) {
  const response = await httpClient.post<any>("/messages", payload)
  return response.data as Message
}

export async function markAsRead(senderId: string) {
  const response = await httpClient.patch<any>(`/messages/${senderId}/read`, {})
  return response.data
}
