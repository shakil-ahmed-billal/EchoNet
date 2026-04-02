import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as AdminService from '@/services/admin.service';
import { toast } from 'sonner';

export const useStoryDuration = () => {
  return useQuery({
    queryKey: ['story-duration'],
    queryFn: AdminService.getStoryDuration,
  });
};

export const useUpdateStoryDuration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (duration: string) => AdminService.updateStoryDuration(duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-duration'] });
      toast.success('Story duration updated successfully');
    },
    onError: () => {
      toast.error('Failed to update story duration');
    },
  });
};
