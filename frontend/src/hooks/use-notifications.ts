import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getNotifications, getUnreadCount, markAsRead, Notification } from "@/services/notifications.service"
import { toast } from "sonner"

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    retry: false,
  })
}

export function useUnreadNotificationsCount() {
  return useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getUnreadCount(),
    refetchInterval: 30000, 
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
