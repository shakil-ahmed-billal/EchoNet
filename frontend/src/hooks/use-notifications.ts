import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getNotifications, getUnreadCount, markAsRead, Notification } from "@/services/notifications.service"
import { toast } from "sonner"

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    retry: false,
    staleTime: 60000, // 1 minute stale time
  })
}

export function useUnreadNotificationsCount() {
  return useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getUnreadCount(),
    refetchInterval: 60000, // Check every minute
    staleTime: 30000, // 30s stale time
    retry: false,
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: () => {
      toast.error("Failed to mark notification as read.")
    }
  })
}
