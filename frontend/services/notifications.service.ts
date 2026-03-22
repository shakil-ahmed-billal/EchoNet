"use server";

import { httpClient } from "@/lib/axios/httpClient"

export interface Notification {
  id: string
  userId: string
  type: "LIKE" | "COMMENT" | "MESSAGE" | "ANNOUNCEMENT" | "FOLLOW"
  message: string
  isRead: boolean
  createdAt: string
  referenceId?: string
}

export async function getNotifications() {
  try {
    const response = await httpClient.get<any>("/notifications")
    return response.data as Notification[]
  } catch (error: any) {
    console.error("NotificationsService failed:", error?.message);
    return [];
  }
}

export async function getUnreadCount() {
  const response = await httpClient.get<any>("/notifications/unread-count")
  return response.data as number
}

export async function markAsRead(id: string) {
  const response = await httpClient.patch<any>(`/notifications/${id}/read`, {})
  return response.data
}
