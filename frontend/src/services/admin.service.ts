import { apiClient } from './api-client';

export const getAdminStats = async () => {
  const { data } = await apiClient.get('/admin/stats');
  return data.data; // Dashboard stats doesn't use pagination, so keeping data.data extraction
};

export const getAllUsers = async (params?: any) => {
  const { data } = await apiClient.get('/admin/users', { params });
  return data;
};

export const updateUserRole = async (id: string, role: string) => {
  const { data } = await apiClient.patch(`/admin/users/${id}/role`, { role });
  return data.data;
};

export const suspendUser = async (id: string) => {
  const { data } = await apiClient.patch(`/users/${id}/suspend`);
  return data.data;
};

export const getAllCategories = async (params?: any) => {
  const { data } = await apiClient.get('/categories', { params });
  return data.data;
};

export const createCategory = async (payload: any) => {
  const { data } = await apiClient.post('/categories', payload);
  return data.data;
};

export const updateCategory = async (id: string, payload: any) => {
  const { data } = await apiClient.put(`/categories/${id}`, payload);
  return data.data;
};

export const deleteCategory = async (id: string) => {
  const { data } = await apiClient.delete(`/categories/${id}`);
  return data.data;
};

export const getAllProperties = async (params?: any) => {
  const { data } = await apiClient.get('/admin/properties', { params });
  return data;
};

export const approveProperty = async (id: string) => {
  const { data } = await apiClient.put(`/properties/${id}/approve`);
  return data.data;
};

export const rejectProperty = async (id: string) => {
  const { data } = await apiClient.put(`/properties/${id}/reject`);
  return data.data;
};

export const getAllAgents = async (params?: any) => {
  const { data } = await apiClient.get('/agents', { params });
  return data.data;
};

export const verifyAgent = async (id: string) => {
  const { data } = await apiClient.put(`/agents/${id}/verify`);
  return data.data;
};

export const getAllProducts = async (params?: any) => {
  const { data } = await apiClient.get('/admin/products', { params });
  return data;
};

export const getFlaggedProducts = async (params?: { page?: number; limit?: number }) => {
  const { data } = await apiClient.get('/admin/products', { params: { status: 'FLAGGED', limit: 12, ...params } });
  return data;
};

export const updateProductStatus = async (id: string, status: string) => {
  const { data } = await apiClient.put(`/products/${id}`, { status });
  return data.data;
};

export const getAllPosts = async (params?: any) => {
  const { data } = await apiClient.get('/admin/posts', { params });
  return data;
};

export const getFlaggedPosts = async (params?: any) => {
  const { data } = await apiClient.get('/admin/posts', { params: { status: 'FLAGGED', limit: 12, ...params } });
  return data;
};

export const deletePost = async (id: string) => {
  const { data } = await apiClient.delete(`/posts/${id}`);
  return data.data;
};

export const updatePostStatus = async (id: string, status: string) => {
  const { data } = await apiClient.patch(`/posts/${id}/status`, { status });
  return data.data;
};

export const getAllStories = async (params?: any) => {
  const { data } = await apiClient.get('/admin/stories', { params });
  return data;
};

export const deleteStory = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/stories/${id}`);
  return data.data;
};

export const deleteUser = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/users/${id}`);
  return data.data;
};
