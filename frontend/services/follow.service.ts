import { apiClient } from './api-client';

export const followUser = async (userId: string) => {
  const { data } = await apiClient.post('/follow/follow', { followingId: userId });
  return data;
};

export const acceptUser = async (senderId: string) => {
  const { data } = await apiClient.post('/follow/accept', { senderId });
  return data;
};

export const unfollowUser = async (userId: string) => {
  const { data } = await apiClient.post('/follow/unfollow', { followingId: userId });
  return data;
};

export const getPendingRequests = async (page = 1, limit = 10) => {
  const { data } = await apiClient.get(`/follow/requests?page=${page}&limit=${limit}`);
  return data.data;
};

export const getSuggestions = async (page = 1, limit = 15) => {
  const { data } = await apiClient.get(`/follow/suggestions?page=${page}&limit=${limit}`);
  return data.data;
};
