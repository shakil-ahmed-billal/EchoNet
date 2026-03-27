import { apiClient } from './api-client';

export const getAdminStats = async () => {
  const { data } = await apiClient.get('/admin/stats');
  return data.data;
};

export const getAllUsers = async (params?: any) => {
  const { data } = await apiClient.get('/users', { params });
  return data.data;
};

export const updateUserRole = async (id: string, role: string) => {
  const { data } = await apiClient.patch(`/users/${id}`, { role });
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
  const { data } = await apiClient.get('/properties', { params });
  return data.data;
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

export const getFlaggedProducts = async (params?: { page?: number; limit?: number }) => {
  const { data } = await apiClient.get('/products', { params: { status: 'FLAGGED', limit: 12, ...params } });
  const result = data.data;
  if (result?.data) return result; // already paginated
  return Array.isArray(result) ? { data: result, meta: null } : result;
};

export const updateProductStatus = async (id: string, status: string) => {
  const { data } = await apiClient.put(`/products/${id}`, { status });
  return data.data;
};

export const getFlaggedPosts = async (params?: any) => {
  const { data } = await apiClient.get('/posts', { params: { status: 'FLAGGED', limit: 12, ...params } });
  return data.data;
};

export const deletePost = async (id: string) => {
  const { data } = await apiClient.delete(`/posts/${id}`);
  return data.data;
};

export const updatePostStatus = async (id: string, status: string) => {
  const { data } = await apiClient.patch(`/posts/${id}/status`, { status });
  return data.data;
};
