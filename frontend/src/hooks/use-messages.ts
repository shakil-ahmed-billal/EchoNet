import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getChatHistory, sendMessage, markAsRead, Message } from "@/services/messages.service"
import { toast } from "sonner"

export function useChatHistory(otherUserId: string) {
  return useQuery<Message[]>({
    queryKey: ["messages", otherUserId],
    queryFn: () => getChatHistory(otherUserId),
    enabled: !!otherUserId,
    retry: false,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { receiverId?: string; groupId?: string; content: string }) => 
      sendMessage(payload),
    onSuccess: (_, variables) => {
      const queryKeyId = variables.groupId || variables.receiverId;
      queryClient.invalidateQueries({ queryKey: ["messages", queryKeyId] })
    },
    onError: () => {
      toast.error("Failed to send message.")
    }
  })
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (senderId: string) => markAsRead(senderId),
    onSuccess: (_, senderId) => {
      // Refresh the chat history to show them as read
      queryClient.invalidateQueries({ queryKey: ["messages", senderId] })
    }
  })
}
