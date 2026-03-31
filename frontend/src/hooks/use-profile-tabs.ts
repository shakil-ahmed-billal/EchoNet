import { useQuery } from '@tanstack/react-query';
import { getUserComments, getFeed } from '@/services/posts.service';

export function useUserReplies(userId: string) {
  return useQuery({
    queryKey: ['user-replies', userId],
    queryFn: () => getUserComments(userId),
    enabled: !!userId,
  });
}

export function useUserMedia(userId: string) {
  return useQuery({
    queryKey: ['user-media', userId],
    queryFn: () => getFeed(undefined, false, userId, true),
    enabled: !!userId,
  });
}
