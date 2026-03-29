import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as AdminService from '@/services/admin.service';
import { toast } from 'sonner';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: AdminService.getAdminStats,
  });
};

// Users
export const useAdminUsers = (params?: { searchTerm?: string; page?: number; limit?: number; role?: string }) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => AdminService.getAllUsers({ limit: 10, ...params }),
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      AdminService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated');
    },
    onError: () => toast.error('Failed to update role'),
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User suspended');
    },
    onError: () => toast.error('Failed to suspend user'),
  });
};

// Categories
export const useAdminCategories = (params?: { searchTerm?: string; page?: number; limit?: number; parentId?: string }) => {
  return useQuery({
    queryKey: ['admin-categories', params],
    queryFn: () => AdminService.getAllCategories({ limit: 12, ...params }),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => AdminService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category created');
    },
    onError: () => toast.error('Failed to create category'),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      AdminService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category updated');
    },
    onError: () => toast.error('Failed to update category'),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
    },
    onError: () => toast.error('Failed to delete category'),
  });
};

// Properties
export const useAdminProperties = (params?: { status?: string; searchTerm?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin-properties', params],
    queryFn: () => AdminService.getAllProperties({ limit: 12, ...params }),
  });
};

export const useApproveProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.approveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Property approved');
    },
    onError: () => toast.error('Failed to approve property'),
  });
};

export const useRejectProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.rejectProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Property rejected');
    },
    onError: () => toast.error('Failed to reject property'),
  });
};

// Agents
export const useAdminAgents = (params?: { page?: number; limit?: number; isVerified?: string }) => {
  return useQuery({
    queryKey: ['admin-agents', params],
    queryFn: () => AdminService.getAllAgents({ limit: 12, ...params }),
  });
};

export const useVerifyAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.verifyAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] });
      toast.success('Agent verified');
    },
    onError: () => toast.error('Failed to verify agent'),
  });
};

export const useAdminProducts = (params?: { searchTerm?: string; page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: () => AdminService.getAllProducts(params),
  });
};

export const useFlaggedProducts = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['flagged-products', params],
    queryFn: () => AdminService.getFlaggedProducts(params),
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      AdminService.updateProductStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-products'] });
      toast.success('Product status updated');
    },
    onError: () => toast.error('Failed to update product'),
  });
};

export const useAdminPosts = (params?: { searchTerm?: string; page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ['admin-posts', params],
    queryFn: () => AdminService.getAllPosts(params),
  });
};

export const useFlaggedPosts = (params?: { searchTerm?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['flagged-posts', params],
    queryFn: () => AdminService.getFlaggedPosts(params),
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-posts'] });
      toast.success('Post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });
};

export const useUpdatePostStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      AdminService.updatePostStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-posts'] });
      toast.success('Post status updated');
    },
    onError: () => toast.error('Failed to update post status'),
  });
};

// Stories
export const useAdminStories = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin-stories', params],
    queryFn: () => AdminService.getAllStories(params),
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.deleteStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
      toast.success('Story permanently deleted');
    },
    onError: () => toast.error('Failed to delete story'),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User and all their data permanently deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });
};
